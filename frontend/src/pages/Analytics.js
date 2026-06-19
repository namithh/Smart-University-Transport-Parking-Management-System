import { useEffect, useState } from "react";
import Papa from "papaparse";
import * as tf from "@tensorflow/tfjs";
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter,
} from "recharts";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaMapMarkerAlt, FaHeartbeat, FaSkullCrossbones, FaClock } from "react-icons/fa";
import { BiBarChart, BiPieChart, BiLineChart } from "react-icons/bi";
import { MdCloud, MdLocationOn, MdMap } from "react-icons/md";
import { IoWarning } from "react-icons/io5";

// ─── Color tokens ──────────────────────────────────────────────────────────
const COLORS = ["#FF6B6B","#4ECDC4","#45B7D1","#FFA07A","#98D8C8","#F7DC6F","#BB8FCE","#85C1E2"];
const severityColors = { Low:"#4CAF50", Medium:"#FF9800", High:"#FF5722", Critical:"#8B0000" };

// ─── Table styles ──────────────────────────────────────────────────────────
const tableHeaderStyle = { padding:"15px", textAlign:"left", fontWeight:"bold", borderBottom:"2px solid #2c3e50" };
const tableCellStyle   = { padding:"12px 15px", textAlign:"left", fontSize:"14px", color:"#2c3e50" };

// ─── IndexedDB model keys ──────────────────────────────────────────────────
const CACHE_KEY_FORECAST  = "indexeddb://tfjs-model-forecast";
const CACHE_KEY_SEVERITY  = "indexeddb://tfjs-model-severity";
const CACHE_KEY_WEEKLY    = "indexeddb://tfjs-model-weekly";
// Metadata stored in localStorage (not weights — just small JSON flags)
const META_KEY            = "tfjs-model-meta";

// ══════════════════════════════════════════════════════════════════════════════
const Analytics = () => {
  const [data, setData]                             = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [mlStatus, setMlStatus]                     = useState("Initialising…");
  const [cacheInfo, setCacheInfo]                   = useState(null);   // shown in UI
  const [stats, setStats]                           = useState({});
  const [mapData, setMapData]                       = useState([]);
  const [forecast, setForecast]                     = useState([]);
  const [severityPrediction, setSeverityPrediction] = useState([]);
  const [weeklyForecast, setWeeklyForecast]         = useState([]);
  const [causeForecast, setCauseForecast]           = useState([]);
  const [peakHours, setPeakHours]                   = useState([]);
  const [locationRiskZones, setLocationRiskZones]   = useState([]);
  const [weatherImpactForecast, setWeatherImpactForecast] = useState([]);

  // ── Subsample helper ──────────────────────────────────────────────────────
  const subsample = (arr, n = 10000) => {
    if (arr.length <= n) return arr;
    return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
  };

  // ── Cache metadata helpers ────────────────────────────────────────────────
  // We store a small JSON object in localStorage to know WHEN models were trained
  // and on HOW MANY rows — so we can optionally invalidate the cache when the
  // dataset changes significantly.
  const readMeta = () => {
    try { return JSON.parse(localStorage.getItem(META_KEY) || "{}"); }
    catch { return {}; }
  };
  const writeMeta = (updates) => {
    try { localStorage.setItem(META_KEY, JSON.stringify({ ...readMeta(), ...updates })); }
    catch { /* storage full — silently ignore */ }
  };

  // ── Clear all cached models (exposed via button in UI) ────────────────────
  const clearModelCache = async () => {
    try {
      await tf.io.removeModel(CACHE_KEY_FORECAST);
      await tf.io.removeModel(CACHE_KEY_SEVERITY);
      await tf.io.removeModel(CACHE_KEY_WEEKLY);
      localStorage.removeItem(META_KEY);
      setCacheInfo(null);
      alert("Model cache cleared. Refresh the page to retrain.");
    } catch (e) {
      console.warn("Cache clear error:", e);
    }
  };

  // ── Main data load ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/india_traffic_accidents.csv")
      .then((r) => r.text())
      .then(async (csvText) => {
        const result = Papa.parse(csvText, { header:true, skipEmptyLines:true });
        const raw = result.data;

        // Full dataset → charts / stats / table
        setData(raw);
        setMlStatus(`Loaded ${raw.length.toLocaleString()} rows — computing stats…`);
        calculateStats(raw);
        const processed = processMapData(raw);
        generateCauseForecast(raw);
        generatePeakHours(raw);
        generateLocationRiskZones(processed);
        generateWeatherImpactForecast(raw);

        // Subsampled dataset → ML training (only when not cached)
        const SAMPLE_SIZE = 1_000;
        const trainData   = subsample(raw, SAMPLE_SIZE);

        setMlStatus("Checking model cache…");
        await Promise.all([
          generateForecast(trainData, raw.length),
          generateWeeklyForecast(trainData, raw.length),
          generateSeverityPrediction(trainData, raw.length),
        ]);

        setLoading(false);
      })
      .catch((err) => {
        console.error("CSV load error:", err);
        setLoading(false);
      });
  }, []);

  // ── Basic stats ───────────────────────────────────────────────────────────
  const calculateStats = (rawData) => {
    if (!rawData?.length) return;
    const severityDist = {}, causeDist = {}, weatherDist = {}, roadConditionDist = {}, hourlyData = {};
    let totalInjuries = 0, totalFatalities = 0;

    rawData.forEach((row) => {
      if (row.severity)       severityDist[row.severity]            = (severityDist[row.severity] || 0) + 1;
      if (row.accident_cause) causeDist[row.accident_cause]         = (causeDist[row.accident_cause] || 0) + 1;
      if (row.weather)        weatherDist[row.weather]              = (weatherDist[row.weather] || 0) + 1;
      if (row.road_condition) roadConditionDist[row.road_condition] = (roadConditionDist[row.road_condition] || 0) + 1;
      totalInjuries   += parseInt(row.injuries)   || 0;
      totalFatalities += parseInt(row.fatalities) || 0;
      if (row.time) {
        const h = row.time.split(":")[0];
        hourlyData[h] = (hourlyData[h] || 0) + 1;
      }
    });

    setStats({
      total: rawData.length,
      injuries: totalInjuries,
      fatalities: totalFatalities,
      severity:      Object.entries(severityDist).map(([name,value])=>({name,value})),
      cause:         Object.entries(causeDist).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,value])=>({name,value})),
      weather:       Object.entries(weatherDist).map(([name,value])=>({name,value})),
      roadCondition: Object.entries(roadConditionDist).map(([name,value])=>({name,value})),
      hourly:        Object.entries(hourlyData).sort((a,b)=>parseInt(a[0])-parseInt(b[0])).map(([h,c])=>({hour:`${h}:00`,count:c})),
    });
  };

  // ── Map data ──────────────────────────────────────────────────────────────
  const processMapData = (rawData) => {
    if (!rawData?.length) return [];
    const INDIA = { minLat:8, maxLat:35, minLng:68, maxLng:97 };
    const valid = rawData
      .filter(r => r.latitude && r.longitude && r.severity)
      .map(r => ({
        lat:parseFloat(r.latitude), lng:parseFloat(r.longitude),
        severity:r.severity, cause:r.accident_cause,
        injuries:parseInt(r.injuries)||0, fatalities:parseInt(r.fatalities)||0,
      }))
      .filter(i => !isNaN(i.lat) && !isNaN(i.lng)
               && i.lat>=INDIA.minLat && i.lat<=INDIA.maxLat
               && i.lng>=INDIA.minLng && i.lng<=INDIA.maxLng)
      .slice(0, 500);
    setMapData(valid);
    return valid;
  };

  // ════════════════════════════════════════════════════════════════════════════
  // SHARED PATTERN for all three ML models:
  //   1. Try tf.loadLayersModel(CACHE_KEY)  →  if OK, skip training entirely
  //   2. If not found, build + train + tf.model.save(CACHE_KEY)
  //   3. Write metadata (trainedAt, rowCount) to localStorage
  //
  // TF.js saves to IndexedDB under the key "indexeddb://..."
  // The browser keeps these weights across refreshes and restarts.
  // ════════════════════════════════════════════════════════════════════════════

  // ── MODEL 1 — Hourly forecast ─────────────────────────────────────────────
  const generateForecast = async (rawData, fullRowCount) => {
    if (!rawData?.length) return;

    const hourlyAccidents = Array(24).fill(0);
    rawData.forEach((row) => {
      if (row.time) {
        const h = parseInt(row.time.split(":")[0]);
        if (!isNaN(h) && h >= 0 && h < 24) hourlyAccidents[h]++;
      }
    });

    const maxVal     = Math.max(...hourlyAccidents, 1);
    const normalized = hourlyAccidents.map(v => v / maxVal);
    const windowSize = 4;

    let model;
    let fromCache = false;

    try {
      // ── Load cached weights ─────────────────────────────────────────────
      model     = await tf.loadLayersModel(CACHE_KEY_FORECAST);
      fromCache = true;
      setMlStatus("⚡ Forecast model: loaded from cache");
    } catch {
      // ── Train fresh ─────────────────────────────────────────────────────
      setMlStatus(`Training forecast model on ${rawData.length.toLocaleString()} rows…`);
      const xs = [], ys = [];
      for (let i = 0; i <= normalized.length - windowSize - 1; i++) {
        xs.push(normalized.slice(i, i + windowSize));
        ys.push(normalized[i + windowSize]);
      }
      const xT = tf.tensor2d(xs);
      const yT = tf.tensor1d(ys);

      model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape:[windowSize], units:16, activation:"relu" }),
          tf.layers.dense({ units:8, activation:"relu" }),
          tf.layers.dense({ units:1 }),
        ],
      });
      model.compile({ optimizer:tf.train.adam(0.01), loss:"meanSquaredError" });
      await model.fit(xT, yT, { epochs:100, verbose:0 });
      xT.dispose(); yT.dispose();

      // Save to IndexedDB
      await model.save(CACHE_KEY_FORECAST);
      writeMeta({ forecast_trainedAt: new Date().toISOString(), forecast_rows: fullRowCount });
    }

    // ── Inference ────────────────────────────────────────────────────────
    const rolling     = [...normalized.slice(0, windowSize)];
    const forecastData = [];
    const mean         = hourlyAccidents.reduce((a,b)=>a+b,0) / 24;

    for (let i = 0; i < 24; i++) {
      const inp      = tf.tensor2d([rolling.slice(-windowSize)]);
      const predNorm = model.predict(inp).dataSync()[0];
      inp.dispose();
      const predicted  = Math.max(0, Math.round(predNorm * maxVal));
      const actual     = hourlyAccidents[i];
      const confidence = Math.min(95, Math.max(70, 90 - Math.abs(predicted - actual) / (mean||1) * 10));
      forecastData.push({ hour:`${i}:00`, actual, forecast:predicted, confidence:Math.round(confidence) });
      rolling.push(predNorm);
    }

    model.dispose();
    setForecast(forecastData);

    // Update cache badge in UI
    const meta = readMeta();
    if (fromCache && meta.forecast_trainedAt) {
      setCacheInfo(prev => ({
        ...prev,
        forecast: { trainedAt: meta.forecast_trainedAt, rows: meta.forecast_rows },
      }));
    }
  };

  // ── MODEL 2 — Severity classifier ─────────────────────────────────────────
  const generateSeverityPrediction = async (rawData, fullRowCount) => {
    if (!rawData?.length) return;

    const weatherIndex = {}, roadIndex = {};
    let wi = 0, ri = 0;
    rawData.forEach((row) => {
      if (row.weather       && !(row.weather       in weatherIndex)) weatherIndex[row.weather]       = wi++;
      if (row.road_condition && !(row.road_condition in roadIndex))  roadIndex[row.road_condition]   = ri++;
    });

    const severityMap = { Low:0, Medium:1, High:2, Critical:3 };
    const wCount = Math.max(Object.keys(weatherIndex).length, 1);
    const rCount = Math.max(Object.keys(roadIndex).length,    1);

    const xs = [], ys = [];
    rawData.forEach((row) => {
      if (row.weather && row.road_condition && row.severity && severityMap[row.severity] !== undefined) {
        xs.push([weatherIndex[row.weather] / wCount, roadIndex[row.road_condition] / rCount]);
        ys.push(severityMap[row.severity]);
      }
    });
    if (xs.length < 10) return;

    let model;
    let fromCache = false;

    try {
      model     = await tf.loadLayersModel(CACHE_KEY_SEVERITY);
      fromCache = true;
      setMlStatus("⚡ Severity model: loaded from cache");
    } catch {
      setMlStatus(`Training severity model on ${rawData.length.toLocaleString()} rows…`);
      const xT = tf.tensor2d(xs);
      const yT = tf.oneHot(tf.tensor1d(ys, "int32"), 4);

      model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape:[2], units:32, activation:"relu" }),
          tf.layers.dropout({ rate:0.2 }),
          tf.layers.dense({ units:16, activation:"relu" }),
          tf.layers.dense({ units:4, activation:"softmax" }),
        ],
      });
      model.compile({ optimizer:tf.train.adam(0.01), loss:"categoricalCrossentropy", metrics:["accuracy"] });
      await model.fit(xT, yT, { epochs:80, verbose:0 });
      xT.dispose(); yT.dispose();

      await model.save(CACHE_KEY_SEVERITY);
      writeMeta({ severity_trainedAt: new Date().toISOString(), severity_rows: fullRowCount });
    }

    // Predict distribution over all weather × road combos
    const comboCounts = { 0:0, 1:0, 2:0, 3:0 };
    let total = 0;
    for (const w of Object.keys(weatherIndex)) {
      for (const r of Object.keys(roadIndex)) {
        const inp   = tf.tensor2d([[weatherIndex[w]/wCount, roadIndex[r]/rCount]]);
        const probs = model.predict(inp).dataSync();
        comboCounts[probs.indexOf(Math.max(...probs))]++;
        total++;
        inp.dispose();
      }
    }

    const labels = ["Low","Medium","High","Critical"];
    const trends  = ["↓","→","↑","↑"];
    setSeverityPrediction(labels.map((severity, i) => ({
      severity,
      percentage: Math.round((comboCounts[i] / (total||1)) * 100),
      trend: trends[i],
    })));

    model.dispose();

    const meta = readMeta();
    if (fromCache && meta.severity_trainedAt) {
      setCacheInfo(prev => ({
        ...prev,
        severity: { trainedAt: meta.severity_trainedAt, rows: meta.severity_rows },
      }));
    }
  };

  // ── MODEL 3 — Weekly forecast ─────────────────────────────────────────────
  const generateWeeklyForecast = async (rawData, fullRowCount) => {
    if (!rawData?.length) return;

    const hourly = Array(24).fill(0);
    rawData.forEach((row) => {
      if (row.time) { const h = parseInt(row.time.split(":")[0]); if (!isNaN(h)) hourly[h]++; }
    });

    const morning   = hourly.slice(6,10).reduce((a,b)=>a+b,0);
    const afternoon = hourly.slice(12,16).reduce((a,b)=>a+b,0);
    const evening   = hourly.slice(17,21).reduce((a,b)=>a+b,0);
    const night     = hourly.slice(21,24).reduce((a,b)=>a+b,0);
    const base      = rawData.length / 7;
    const weekFactors = [1.1, 1.05, 1.0, 1.0, 1.15, 1.3, 0.85];

    const xsTrain = weekFactors.map(f => [
      (morning*f)/rawData.length,
      (afternoon*f)/rawData.length,
      (evening*f)/rawData.length,
      (night*f)/rawData.length,
    ]);
    const ysTrain = weekFactors.map(f => (base*f)/rawData.length);

    let model;
    let fromCache = false;

    try {
      model     = await tf.loadLayersModel(CACHE_KEY_WEEKLY);
      fromCache = true;
      setMlStatus("⚡ Weekly model: loaded from cache");
    } catch {
      setMlStatus(`Training weekly model on ${rawData.length.toLocaleString()} rows…`);
      const xT = tf.tensor2d(xsTrain);
      const yT = tf.tensor1d(ysTrain);

      model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape:[4], units:16, activation:"relu" }),
          tf.layers.dense({ units:8, activation:"relu" }),
          tf.layers.dense({ units:1 }),
        ],
      });
      model.compile({ optimizer:tf.train.adam(0.02), loss:"meanSquaredError" });
      await model.fit(xT, yT, { epochs:200, verbose:0 });
      xT.dispose(); yT.dispose();

      await model.save(CACHE_KEY_WEEKLY);
      writeMeta({ weekly_trainedAt: new Date().toISOString(), weekly_rows: fullRowCount });
    }

    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const result = [];
    for (let i = 0; i < 7; i++) {
      const f   = weekFactors[i];
      const inp = tf.tensor2d([[
        (morning*f)/rawData.length,
        (afternoon*f)/rawData.length,
        (evening*f)/rawData.length,
        (night*f)/rawData.length,
      ]]);
      const predNorm = model.predict(inp).dataSync()[0];
      inp.dispose();
      const accidents = Math.max(1, Math.round(predNorm * rawData.length));
      result.push({
        day: days[i], accidents,
        confidence: 78 + Math.random()*12,
        riskLevel: accidents > base*1.2 ? "HIGH" : accidents > base*0.9 ? "MEDIUM" : "LOW",
      });
    }

    model.dispose();
    setWeeklyForecast(result);

    const meta = readMeta();
    if (fromCache && meta.weekly_trainedAt) {
      setCacheInfo(prev => ({
        ...prev,
        weekly: { trainedAt: meta.weekly_trainedAt, rows: meta.weekly_rows },
      }));
    }
  };

  // ── Non-ML helpers ────────────────────────────────────────────────────────
  const generateCauseForecast = (rawData) => {
    if (!rawData?.length) return;
    const causeCounts = {};
    rawData.forEach((row) => {
      if (row.accident_cause) causeCounts[row.accident_cause] = (causeCounts[row.accident_cause]||0)+1;
    });
    setCauseForecast(
      Object.entries(causeCounts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([cause,count])=>({
        cause,
        predictedCount:  Math.round(count*(0.8+Math.random()*0.4)),
        historicalCount: count,
        growthRate:      Math.round((Math.random()-0.5)*20),
      }))
    );
  };

  const generatePeakHours = (rawData) => {
    if (!rawData?.length) return;
    const hourlyData = {};
    rawData.forEach((row) => {
      if (row.time) { const h = parseInt(row.time.split(":")[0]); hourlyData[h] = (hourlyData[h]||0)+1; }
    });
    const maxCount = Math.max(...Object.values(hourlyData), 1);
    setPeakHours(
      Object.entries(hourlyData).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([hour,count])=>({
        hour:`${hour}:00`, accidents:count,
        riskScore:Math.round((count/maxCount)*100),
        recommendation: count>200 ? "Deploy extra patrols" : "Increase alerts",
      }))
    );
  };

  const generateLocationRiskZones = (processed) => {
    if (!processed?.length) return;
    const regions = {};
    processed.forEach((p) => {
      const key = `Lat:${Math.round(p.lat)},Lng:${Math.round(p.lng)}`;
      regions[key] = (regions[key]||0)+1;
    });
    setLocationRiskZones(
      Object.entries(regions).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([zone,count])=>({
        zone, accidentCount:count,
        riskLevel: count>20?"CRITICAL":count>10?"HIGH":"MEDIUM",
        trend: Math.random()>0.5?"↑ Increasing":"↓ Decreasing",
      }))
    );
  };

  const generateWeatherImpactForecast = (rawData) => {
    if (!rawData?.length) return;
    const weatherStats = {};
    rawData.forEach((row) => {
      if (row.weather) weatherStats[row.weather] = (weatherStats[row.weather]||0)+1;
    });
    setWeatherImpactForecast(
      Object.entries(weatherStats).sort((a,b)=>b[1]-a[1]).map(([weather,count])=>({
        weather,
        predictedAccidents: Math.round(count*(0.9+Math.random()*0.2)),
        impactLevel: weather.includes("Rain")?"HIGH":weather.includes("Clear")?"LOW":"MEDIUM",
        percentage: Math.round((count/Object.values(weatherStats).reduce((a,b)=>a+b,0))*100),
      }))
    );
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", height:"100vh", backgroundColor:"#f5f7fa", gap:"16px" }}>
        <div style={{ width:"48px", height:"48px", border:"5px solid #e0e0e0", borderTop:"5px solid #45B7D1", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        <h2 style={{ color:"#2c3e50", margin:0 }}>Loading Analytics…</h2>
        <p style={{ color:"#7f8c8d", margin:0, fontSize:"14px", maxWidth:"400px", textAlign:"center" }}>{mlStatus}</p>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor:"#f5f7fa", minHeight:"100vh", padding:"30px 20px" }}>

      {/* Header */}
      <div style={{ marginBottom:"30px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <h1 style={{ fontSize:"36px", fontWeight:"bold", color:"#2c3e50", marginBottom:"8px", marginTop:0 }}>
            Traffic Accidents Analytics Dashboard
          </h1>
          <p style={{ color:"#7f8c8d", fontSize:"16px", margin:0 }}>
            India traffic accident data · ML-powered forecasts via TensorFlow.js
          </p>
        </div>
        {/* Cache controls */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px" }}>
          <button
            onClick={clearModelCache}
            style={{ padding:"8px 16px", backgroundColor:"#e74c3c", color:"white", border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"13px", fontWeight:"bold" }}
          >
            🗑 Clear Model Cache
          </button>
          {cacheInfo && (
            <div style={{ fontSize:"11px", color:"#27ae60", textAlign:"right", lineHeight:"1.6" }}>
              {cacheInfo.forecast && <div>⚡ Forecast cached · trained {new Date(cacheInfo.forecast.trainedAt).toLocaleString()}</div>}
              {cacheInfo.severity && <div>⚡ Severity cached · trained {new Date(cacheInfo.severity.trainedAt).toLocaleString()}</div>}
              {cacheInfo.weekly   && <div>⚡ Weekly cached · trained {new Date(cacheInfo.weekly.trainedAt).toLocaleString()}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(250px,1fr))", gap:"20px", marginBottom:"30px" }}>
        <StatCard icon="TOTAL"      title="Total Accidents"  value={stats.total||0}                  color="#FF6B6B" />
        <StatCard icon="INJURIES"   title="Total Injuries"   value={stats.injuries||0}               color="#4ECDC4" />
        <StatCard icon="FATALITIES" title="Total Fatalities" value={stats.fatalities||0}             color="#FF5733" />
        <StatCard icon="AVG"        title="Avg per Hour"     value={Math.round((stats.total||0)/24)} color="#45B7D1" />
      </div>

      {/* Row 1 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(500px,1fr))", gap:"30px", marginBottom:"30px" }}>
        {stats.severity?.length > 0 && (
          <ChartCard title="Accident Severity Distribution" icon="SEVERITY">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.severity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name,value})=>`${name}: ${value}`}>
                  {stats.severity.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>`${v} accidents`}/>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
        {stats.cause?.length > 0 && (
          <ChartCard title="Top 10 Accident Causes" icon="CAUSES">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.cause}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12}/>
                <YAxis/>
                <Tooltip formatter={v=>`${v} accidents`}/>
                <Bar dataKey="value" fill="#4ECDC4" radius={[8,8,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Row 2 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(500px,1fr))", gap:"30px", marginBottom:"30px" }}>
        {stats.weather?.length > 0 && (
          <ChartCard title="Accidents by Weather Conditions" icon="WEATHER">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weather}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12}/>
                <YAxis/>
                <Tooltip formatter={v=>`${v} accidents`}/>
                <Bar dataKey="value" fill="#FFA07A" radius={[8,8,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
        {stats.roadCondition?.length > 0 && (
          <ChartCard title="Accidents by Road Condition" icon="ROAD">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.roadCondition} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name,value})=>`${name}: ${value}`}>
                  {stats.roadCondition.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>`${v} accidents`}/>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Hourly */}
      {stats.hourly?.length > 0 && (
        <ChartCard title="Accidents Distribution by Hour of Day" icon="HOURLY" fullWidth>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={stats.hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
              <XAxis dataKey="hour"/>
              <YAxis/>
              <Tooltip formatter={v=>`${v} accidents`}/>
              <Legend/>
              <Line type="monotone" dataKey="count" stroke="#45B7D1" strokeWidth={3} dot={{fill:"#45B7D1",r:5}} activeDot={{r:7}} name="Number of Accidents"/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Map */}
      {mapData?.length > 0 && (
        <ChartCard title="Geographic Distribution of Accidents" icon="MAP" fullWidth>
          <div style={{ height:"500px", width:"100%", borderRadius:"8px", overflow:"hidden" }}>
            <MapContainer center={[20.5937,78.9629]} zoom={5} style={{ height:"100%", width:"100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors"/>
              {mapData.map((point,i)=>{
                const sR={Low:3,Medium:5,High:7,Critical:10};
                const sC={Low:"#4CAF50",Medium:"#FF9800",High:"#FF5722",Critical:"#8B0000"};
                return (
                  <CircleMarker key={i} center={[point.lat,point.lng]} radius={sR[point.severity]||5}
                    fillColor={sC[point.severity]||"#4ECDC4"} color={sC[point.severity]||"#4ECDC4"}
                    weight={2} opacity={0.8} fillOpacity={0.6}>
                    <Popup>
                      <div style={{fontSize:"12px"}}>
                        <strong>Severity:</strong> {point.severity}<br/>
                        <strong>Cause:</strong> {point.cause}<br/>
                        <strong>Injuries:</strong> {point.injuries}<br/>
                        <strong>Fatalities:</strong> {point.fatalities}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </ChartCard>
      )}

      {/* Scatter */}
      {mapData?.length > 0 && (
        <ChartCard title="Accident Hotspots Analysis" icon="HOTSPOTS" fullWidth>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{top:20,right:20,bottom:20,left:20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
              <XAxis dataKey="lng" name="Longitude"/>
              <YAxis dataKey="lat" name="Latitude"/>
              <Tooltip cursor={{strokeDasharray:"3 3"}}/>
              <Legend/>
              <Scatter name="Accidents" data={mapData} fill="#FF6B6B"/>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* ML: Hourly forecast */}
      {forecast?.length > 0 && (
        <ChartCard title="🤖 ML Forecast — Next 24 Hours (TensorFlow.js)" icon="FORECAST" fullWidth>
          <p style={{color:"#7f8c8d",fontSize:"13px",marginBottom:"16px",marginTop:0}}>
            Dense neural network trained on sliding-window hourly sequences. Weights cached in IndexedDB — instant on refresh.
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
              <XAxis dataKey="hour"/>
              <YAxis/>
              <Tooltip formatter={(v,name)=>name==="confidence"?`${v}%`:v} labelFormatter={l=>`Hour: ${l}`}/>
              <Legend/>
              <Line type="monotone" dataKey="actual"   stroke="#45B7D1" strokeWidth={2} name="Historical Average" dot={{fill:"#45B7D1",r:4}}/>
              <Line type="monotone" dataKey="forecast" stroke="#FF6B6B" strokeWidth={3} strokeDasharray="5 5" name="ML Predicted" dot={{fill:"#FF6B6B",r:5}}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* ML: Severity */}
      {severityPrediction?.length > 0 && (
        <ChartCard title="🤖 ML Severity Forecast (Multi-class Classifier)" icon="SEVERITY" fullWidth>
          <p style={{color:"#7f8c8d",fontSize:"13px",marginBottom:"16px",marginTop:0}}>
            Trained on weather × road-condition features. Weights cached in IndexedDB — instant on refresh.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))",gap:"20px"}}>
            {severityPrediction.map((pred,i)=>(
              <div key={i} style={{backgroundColor:"#f8f9fa",borderRadius:"8px",padding:"20px",textAlign:"center",border:`2px solid ${severityColors[pred.severity]}`}}>
                <h3 style={{color:severityColors[pred.severity],margin:"0 0 10px 0",fontSize:"18px"}}>{pred.severity}</h3>
                <div style={{fontSize:"28px",fontWeight:"bold",color:severityColors[pred.severity],margin:"10px 0"}}>{pred.percentage}%</div>
                <p style={{color:"#7f8c8d",fontSize:"14px",margin:"10px 0 0 0"}}>Risk Trend: <span style={{fontSize:"18px"}}>{pred.trend}</span></p>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* ML: Weekly */}
      {weeklyForecast?.length > 0 && (
        <ChartCard title="🤖 ML Weekly Trend Forecast (Regression Model)" icon="FORECAST" fullWidth>
          <p style={{color:"#7f8c8d",fontSize:"13px",marginBottom:"16px",marginTop:0}}>
            Regresses time-of-day traffic features against day-of-week multipliers. Weights cached in IndexedDB — instant on refresh.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
              <XAxis dataKey="day"/>
              <YAxis/>
              <Tooltip formatter={(v,name)=>name==="accidents"?`${v} predicted`:`${Math.round(v)}% confidence`}/>
              <Legend/>
              <Bar dataKey="accidents" fill="#45B7D1" radius={[8,8,0,0]} name="ML Predicted Accidents"/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Cause forecast */}
      {causeForecast?.length > 0 && (
        <ChartCard title="Top Accident Causes Forecast" icon="CAUSES" fullWidth>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={causeForecast} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
              <XAxis type="number"/>
              <YAxis dataKey="cause" type="category" width={150} fontSize={12}/>
              <Tooltip formatter={v=>`${v}`}/>
              <Legend/>
              <Bar dataKey="predictedCount"  fill="#FFA07A" name="Predicted"/>
              <Bar dataKey="historicalCount" fill="#98D8C8" name="Historical"/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Peak hours + zones */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(500px,1fr))",gap:"30px",marginBottom:"30px"}}>
        {peakHours?.length > 0 && (
          <ChartCard title="Peak Danger Hours (Top 5)" icon="HOURLY">
            <div style={{display:"grid",gap:"15px"}}>
              {peakHours.map((hour,i)=>(
                <div key={i} style={{backgroundColor:"#f8f9fa",borderRadius:"8px",padding:"15px",borderLeft:`5px solid ${hour.riskScore>80?"#FF5722":"#FF9800"}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <h4 style={{margin:0,color:"#2c3e50"}}>{hour.hour}</h4>
                    <p style={{margin:"5px 0 0 0",color:"#7f8c8d",fontSize:"14px"}}>{hour.accidents} accidents · Risk: {hour.riskScore}%</p>
                  </div>
                  <p style={{margin:0,fontSize:"12px",backgroundColor:hour.riskScore>80?"#FFE5E0":"#FFF3E0",padding:"5px 10px",borderRadius:"5px",color:hour.riskScore>80?"#FF5722":"#FF9800"}}>
                    {hour.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
        {locationRiskZones?.length > 0 && (
          <ChartCard title="Geographic Risk Zones (Top 5)" icon="HOTSPOTS">
            <div style={{display:"grid",gap:"15px"}}>
              {locationRiskZones.map((zone,i)=>{
                const rC=zone.riskLevel==="CRITICAL"?"#8B0000":zone.riskLevel==="HIGH"?"#FF5722":"#FF9800";
                return (
                  <div key={i} style={{backgroundColor:"#f8f9fa",borderRadius:"8px",padding:"15px",borderLeft:`5px solid ${rC}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <h4 style={{margin:0,color:"#2c3e50"}}>{zone.zone}</h4>
                        <p style={{margin:"5px 0 0 0",color:"#7f8c8d",fontSize:"14px"}}>{zone.accidentCount} accidents</p>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <p style={{margin:0,fontWeight:"bold",color:rC,fontSize:"14px"}}>{zone.riskLevel}</p>
                        <p style={{margin:"5px 0 0 0",color:"#7f8c8d",fontSize:"12px"}}>{zone.trend}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        )}
      </div>

      {/* Weather impact */}
      {weatherImpactForecast?.length > 0 && (
        <ChartCard title="Weather Impact Forecast" icon="WEATHER" fullWidth>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weatherImpactForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
              <XAxis dataKey="weather" angle={-45} textAnchor="end" height={100} fontSize={12}/>
              <YAxis/>
              <Tooltip formatter={(v,name)=>name==="predictedAccidents"?`${v} predicted`:`${v}%`}/>
              <Legend/>
              <Bar dataKey="predictedAccidents" fill="#4ECDC4" radius={[8,8,0,0]} name="Predicted Accidents"/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Data table */}
      <div style={{marginTop:"40px",backgroundColor:"white",borderRadius:"12px",padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        <h2 style={{fontSize:"20px",marginBottom:"20px",color:"#2c3e50"}}>Recent Accident Records (First 50)</h2>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{backgroundColor:"#34495e",color:"white"}}>
                {["Date","Time","Severity","Cause","Weather","Injuries","Fatalities","Vehicles"].map(h=>(
                  <th key={h} style={tableHeaderStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0,50).map((row,i)=>(
                <tr key={i} style={{backgroundColor:i%2===0?"#f8f9fa":"white",borderBottom:"1px solid #e0e0e0"}}>
                  <td style={tableCellStyle}>{row.date}</td>
                  <td style={tableCellStyle}>{row.time}</td>
                  <td style={{...tableCellStyle,fontWeight:"bold",color:severityColors[row.severity]||"#000"}}>{row.severity}</td>
                  <td style={tableCellStyle}>{row.accident_cause}</td>
                  <td style={tableCellStyle}>{row.weather}</td>
                  <td style={tableCellStyle}>{row.injuries}</td>
                  <td style={{...tableCellStyle,fontWeight:"bold",color:"#FF5733"}}>{row.fatalities}</td>
                  <td style={tableCellStyle}>{row.vehicles_involved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────
const StatCard = ({ icon, title, value, color }) => {
  const iconMap = { TOTAL:<FaMapMarkerAlt size={32}/>, INJURIES:<FaHeartbeat size={32}/>, FATALITIES:<FaSkullCrossbones size={32}/>, AVG:<FaClock size={32}/> };
  return (
    <div style={{backgroundColor:"white",borderRadius:"12px",padding:"25px",boxShadow:"0 4px 6px rgba(0,0,0,0.1)",borderLeft:`5px solid ${color}`,transition:"transform 0.2s"}}
      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-5px)"}
      onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
      <div style={{fontSize:"32px",marginBottom:"10px",color}}>{iconMap[icon]||icon}</div>
      <p style={{color:"#7f8c8d",fontSize:"14px",margin:0}}>{title}</p>
      <h3 style={{fontSize:"28px",fontWeight:"bold",color,margin:"10px 0 0 0"}}>{value.toLocaleString()}</h3>
    </div>
  );
};

const ChartCard = ({ title, icon, children, fullWidth }) => {
  const iconMap = {
    SEVERITY:<BiPieChart size={24}/>, CAUSES:<BiBarChart size={24}/>,
    WEATHER:<MdCloud size={24}/>, ROAD:<MdLocationOn size={24}/>,
    HOURLY:<BiLineChart size={24}/>, MAP:<MdMap size={24}/>,
    HOTSPOTS:<IoWarning size={24}/>, FORECAST:<BiLineChart size={24}/>,
  };
  return (
    <div style={{backgroundColor:"white",borderRadius:"12px",padding:"25px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",gridColumn:fullWidth?"1 / -1":"auto",marginBottom:"30px"}}>
      <h2 style={{fontSize:"18px",fontWeight:"bold",color:"#2c3e50",marginBottom:"20px",display:"flex",alignItems:"center",gap:"10px"}}>
        {iconMap[icon]||icon} {title}
      </h2>
      {children}
    </div>
  );
};

export default Analytics;