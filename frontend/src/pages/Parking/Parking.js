import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaLayerGroup, FaParking, FaSyncAlt, FaTrash } from "react-icons/fa";
import ParkingStatusBadge from "../../component/parking/ParkingStatusBadge";
import { PARKING_POLLING_INTERVAL_MS, PARKING_TIMEZONE_LABEL, formatDurationMinutes, formatParkingDateTime } from "../../lib/parking";
import {
  adminCancelParkingReservation,
  adminCheckInParkingReservation,
  adminCheckOutParkingReservation,
  bulkCreateAdminParkingSlots,
  createAdminParkingSlot,
  createAdminParkingZone,
  deleteAdminParkingSlot,
  deleteAdminParkingZone,
  fetchAdminParkingDashboard,
  fetchAdminParkingReservations,
  fetchAdminParkingSlots,
  fetchAdminParkingUsage,
  fetchAdminParkingZones,
  seedAdminParkingData,
  updateAdminParkingSlot,
  updateAdminParkingSlotStatus,
  updateAdminParkingZone,
} from "../../services/parkingService";

const zoneDefaults = { name: "", code: "", supportedVehicleTypes: ["car", "bike"], status: "active", description: "", locationDescription: "", notes: "" };
const slotDefaults = { slotCode: "", zoneId: "", vehicleType: "car", status: "available", isActive: true, remarks: "" };
const bulkDefaults = { zoneId: "", vehicleType: "car", count: 10, startNumber: 1, padding: 3, prefix: "", remarks: "" };

const Stat = ({ label, value, tone }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-3xl font-bold text-gray-800">{value}</p></div>
      <div className={`rounded-2xl p-4 ${tone}`}><FaParking /></div>
    </div>
  </div>
);

const Parking = () => {
  const [dashboard, setDashboard] = useState(null);
  const [zones, setZones] = useState([]);
  const [slots, setSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [usage, setUsage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [zoneForm, setZoneForm] = useState(zoneDefaults);
  const [slotForm, setSlotForm] = useState(slotDefaults);
  const [bulkForm, setBulkForm] = useState(bulkDefaults);
  const [editingZoneId, setEditingZoneId] = useState("");
  const [editingSlotId, setEditingSlotId] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [slotFilters, setSlotFilters] = useState({ zoneId: "", vehicleType: "", status: "", search: "" });
  const [reservationFilters, setReservationFilters] = useState({ zoneId: "", vehicleType: "", status: "", date: "" });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (mounted) setIsLoading(true);
        const [dashboardData, zoneData, slotData, reservationData, usageData] = await Promise.all([
          fetchAdminParkingDashboard({ zoneId: reservationFilters.zoneId, vehicleType: reservationFilters.vehicleType }),
          fetchAdminParkingZones(),
          fetchAdminParkingSlots(slotFilters),
          fetchAdminParkingReservations(reservationFilters),
          fetchAdminParkingUsage({ zoneId: reservationFilters.zoneId, vehicleType: reservationFilters.vehicleType }),
        ]);
        if (!mounted) return;
        setDashboard(dashboardData);
        setZones(zoneData);
        setSlots(slotData);
        setReservations(reservationData);
        setUsage(usageData);
      } catch (error) {
        if (mounted) toast.error(error.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    const intervalId = setInterval(load, PARKING_POLLING_INTERVAL_MS);
    return () => { mounted = false; clearInterval(intervalId); };
  }, [refreshKey, slotFilters, reservationFilters]);

  const summary = dashboard?.summary || {};
  const runAction = async (work, successMessage) => {
    try {
      setIsActionLoading(true);
      await work();
      toast.success(successMessage);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const saveZone = async (event) => {
    event.preventDefault();
    await runAction(
      () => (editingZoneId ? updateAdminParkingZone(editingZoneId, zoneForm) : createAdminParkingZone(zoneForm)),
      "Parking zone saved"
    );
    setZoneForm(zoneDefaults);
    setEditingZoneId("");
  };

  const saveSlot = async (event) => {
    event.preventDefault();
    await runAction(
      () => (editingSlotId ? updateAdminParkingSlot(editingSlotId, slotForm) : createAdminParkingSlot(slotForm)),
      "Parking slot saved"
    );
    setSlotForm(slotDefaults);
    setEditingSlotId("");
  };

  const saveBulk = async (event) => {
    event.preventDefault();
    await runAction(() => bulkCreateAdminParkingSlots(bulkForm), "Parking slots created");
    setBulkForm({ ...bulkDefaults, zoneId: zones[0]?._id || "" });
    setShowBulk(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Admin Dashboard</p>
              <h1 className="mt-1 text-3xl font-bold text-gray-800">Parking Management</h1>
              <p className="mt-2 text-sm text-gray-500">{PARKING_TIMEZONE_LABEL}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="inline-flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-500 hover:text-white"><FaSyncAlt /> Refresh</button>
              <button type="button" onClick={() => runAction(() => seedAdminParkingData(), "Sample parking data prepared")} className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-400 hover:text-white"><FaLayerGroup /> Seed Sample Data</button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Stat label="Total Zones" value={summary.totalZones || 0} tone="bg-green-100 text-green-700" />
          <Stat label="Total Slots" value={summary.totalSlots || 0} tone="bg-blue-100 text-blue-700" />
          <Stat label="Available Slots" value={summary.availableSlots || 0} tone="bg-green-100 text-green-700" />
          <Stat label="Occupied Slots" value={summary.occupiedSlots || 0} tone="bg-blue-100 text-blue-700" />
          <Stat label="Reserved Slots" value={summary.reservedSlots || 0} tone="bg-amber-100 text-amber-700" />
          <Stat label="Unavailable Slots" value={summary.unavailableSlots || 0} tone="bg-red-100 text-red-700" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <form onSubmit={saveZone} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-gray-800">{editingZoneId ? "Edit Parking Zone" : "Create Parking Zone"}</h2>{editingZoneId ? <button type="button" onClick={() => { setEditingZoneId(""); setZoneForm(zoneDefaults); }} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Reset</button> : null}</div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input value={zoneForm.name} onChange={(e) => setZoneForm((p) => ({ ...p, name: e.target.value }))} placeholder="Zone name" className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" required />
              <input value={zoneForm.code} onChange={(e) => setZoneForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="Zone code" className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" required />
              <select value={zoneForm.status} onChange={(e) => setZoneForm((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"><option value="active">Active</option><option value="inactive">Inactive</option></select>
              <input value={zoneForm.locationDescription} onChange={(e) => setZoneForm((p) => ({ ...p, locationDescription: e.target.value }))} placeholder="Location description" className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">{["car", "bike"].map((type) => <button key={type} type="button" onClick={() => setZoneForm((p) => { const exists = p.supportedVehicleTypes.includes(type); const next = exists ? p.supportedVehicleTypes.filter((item) => item !== type) : [...p.supportedVehicleTypes, type]; return { ...p, supportedVehicleTypes: next.length ? next : [type] }; })} className={`rounded-xl px-4 py-3 text-sm font-semibold capitalize ${zoneForm.supportedVehicleTypes.includes(type) ? "bg-green-400 text-black shadow-md" : "border border-gray-300 text-gray-600"}`}>{type}</button>)}</div>
            <textarea rows={3} value={zoneForm.description} onChange={(e) => setZoneForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
            <textarea rows={3} value={zoneForm.notes} onChange={(e) => setZoneForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
            <button type="submit" disabled={isActionLoading} className="mt-4 rounded-xl bg-green-400 px-5 py-3 text-sm font-semibold text-black shadow-md hover:bg-green-500 hover:text-white disabled:opacity-70">Save Zone</button>
          </form>

          <form onSubmit={saveSlot} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-gray-800">{editingSlotId ? "Edit Parking Slot" : "Register Parking Slot"}</h2>{editingSlotId ? <button type="button" onClick={() => { setEditingSlotId(""); setSlotForm(slotDefaults); }} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Reset</button> : null}</div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input value={slotForm.slotCode} onChange={(e) => setSlotForm((p) => ({ ...p, slotCode: e.target.value.toUpperCase() }))} placeholder="Slot code" className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" required />
              <select value={slotForm.zoneId} onChange={(e) => setSlotForm((p) => ({ ...p, zoneId: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" required><option value="">Select zone</option>{zones.map((zone) => <option key={zone._id} value={zone._id}>{zone.name} ({zone.code})</option>)}</select>
              <select value={slotForm.vehicleType} onChange={(e) => setSlotForm((p) => ({ ...p, vehicleType: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"><option value="car">Car</option><option value="bike">Bike</option></select>
              <select value={slotForm.status} onChange={(e) => setSlotForm((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"><option value="available">Available</option><option value="unavailable">Unavailable</option><option value="maintenance">Maintenance</option></select>
            </div>
            <textarea rows={3} value={slotForm.remarks} onChange={(e) => setSlotForm((p) => ({ ...p, remarks: e.target.value }))} placeholder="Remarks" className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
            <button type="submit" disabled={isActionLoading} className="mt-4 rounded-xl bg-green-400 px-5 py-3 text-sm font-semibold text-black shadow-md hover:bg-green-500 hover:text-white disabled:opacity-70">Save Slot</button>
            <button type="button" onClick={() => { setShowBulk((value) => !value); setBulkForm((p) => ({ ...p, zoneId: p.zoneId || zones[0]?._id || "" })); }} className="ml-3 mt-4 rounded-xl bg-amber-100 px-5 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-400 hover:text-white">Bulk Create</button>
          </form>
        </div>

        {showBulk ? (
          <form onSubmit={saveBulk} className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">Bulk Create Slots</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <select value={bulkForm.zoneId} onChange={(e) => setBulkForm((p) => ({ ...p, zoneId: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" required><option value="">Zone</option>{zones.map((zone) => <option key={zone._id} value={zone._id}>{zone.code}</option>)}</select>
              <select value={bulkForm.vehicleType} onChange={(e) => setBulkForm((p) => ({ ...p, vehicleType: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"><option value="car">Car</option><option value="bike">Bike</option></select>
              <input type="number" min="1" value={bulkForm.count} onChange={(e) => setBulkForm((p) => ({ ...p, count: Number(e.target.value) }))} placeholder="Count" className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
              <input type="number" min="1" value={bulkForm.startNumber} onChange={(e) => setBulkForm((p) => ({ ...p, startNumber: Number(e.target.value) }))} placeholder="Start" className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
              <input type="number" min="2" value={bulkForm.padding} onChange={(e) => setBulkForm((p) => ({ ...p, padding: Number(e.target.value) }))} placeholder="Padding" className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
              <input value={bulkForm.prefix} onChange={(e) => setBulkForm((p) => ({ ...p, prefix: e.target.value.toUpperCase() }))} placeholder="Prefix" className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
            </div>
            <button type="submit" disabled={isActionLoading} className="mt-4 rounded-xl bg-green-400 px-5 py-3 text-sm font-semibold text-black shadow-md hover:bg-green-500 hover:text-white disabled:opacity-70">Create Slots</button>
          </form>
        ) : null}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6"><h2 className="text-xl font-semibold text-gray-800">Parking Zones</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50"><tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Zone</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Support</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Slots</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th><th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100">{zones.map((zone) => <tr key={zone._id} className="hover:bg-gray-50"><td className="px-6 py-4"><p className="font-semibold text-gray-800">{zone.name}</p><p className="text-sm text-gray-500">{zone.code} - {zone.locationDescription || "Campus zone"}</p></td><td className="px-6 py-4 text-sm capitalize text-gray-600">{(zone.supportedVehicleTypes || []).join(", ")}</td><td className="px-6 py-4 text-sm text-gray-600">{zone.totalSlots || 0}</td><td className="px-6 py-4"><ParkingStatusBadge status={zone.status} /></td><td className="px-6 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => { setEditingZoneId(zone._id); setZoneForm({ name: zone.name || "", code: zone.code || "", supportedVehicleTypes: zone.supportedVehicleTypes || ["car", "bike"], status: zone.status || "active", description: zone.description || "", locationDescription: zone.locationDescription || "", notes: zone.notes || "" }); }} className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-500 hover:text-white"><FaEdit /> Edit</button><button type="button" onClick={() => { if (window.confirm("Delete this parking zone?")) runAction(() => deleteAdminParkingZone(zone._id), "Parking zone deleted"); }} className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-500 hover:text-white"><FaTrash /> Delete</button></div></td></tr>)}</tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6"><h2 className="text-xl font-semibold text-gray-800">Parking Slots</h2></div>
          <div className="grid gap-4 border-b border-gray-100 p-6 md:grid-cols-4">
            <select value={slotFilters.zoneId} onChange={(e) => setSlotFilters((p) => ({ ...p, zoneId: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"><option value="">All zones</option>{zones.map((zone) => <option key={zone._id} value={zone._id}>{zone.name}</option>)}</select>
            <select value={slotFilters.vehicleType} onChange={(e) => setSlotFilters((p) => ({ ...p, vehicleType: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"><option value="">All vehicle types</option><option value="car">Car</option><option value="bike">Bike</option></select>
            <select value={slotFilters.status} onChange={(e) => setSlotFilters((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"><option value="">All statuses</option><option value="available">Available</option><option value="reserved">Reserved</option><option value="occupied">Occupied</option><option value="unavailable">Unavailable</option><option value="maintenance">Maintenance</option></select>
            <input value={slotFilters.search} onChange={(e) => setSlotFilters((p) => ({ ...p, search: e.target.value }))} placeholder="Search slot code" className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-yellow-100"><tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Slot</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Zone</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Vehicle</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th><th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100">{slots.map((slot) => <tr key={slot._id} className="hover:bg-gray-50"><td className="px-6 py-4"><p className="font-semibold text-gray-800">{slot.slotCode}</p><p className="text-sm text-gray-500">{slot.remarks || "No remarks"}</p></td><td className="px-6 py-4 text-sm text-gray-600">{slot.zoneId?.name || "-"} ({slot.zoneId?.code || "-"})</td><td className="px-6 py-4 text-sm capitalize text-gray-600">{slot.vehicleType}</td><td className="px-6 py-4"><ParkingStatusBadge status={slot.status} /></td><td className="px-6 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => { setEditingSlotId(slot._id); setSlotForm({ slotCode: slot.slotCode || "", zoneId: slot.zoneId?._id || "", vehicleType: slot.vehicleType || "car", status: ["available", "unavailable", "maintenance"].includes(slot.status) ? slot.status : "available", isActive: slot.isActive !== false, remarks: slot.remarks || "" }); }} className="rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-500 hover:text-white">Edit</button><button type="button" onClick={() => { if (window.confirm("Delete this parking slot?")) runAction(() => deleteAdminParkingSlot(slot._id), "Parking slot deleted"); }} className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-500 hover:text-white">Delete</button>{["available", "unavailable", "maintenance"].map((status) => <button key={status} type="button" onClick={() => runAction(() => updateAdminParkingSlotStatus(slot._id, status), `Slot marked ${status}`)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold capitalize text-gray-600 hover:border-green-300 hover:bg-green-50">{status}</button>)}</div></td></tr>)}</tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6"><h2 className="text-xl font-semibold text-gray-800">Reservation Monitoring</h2></div>
          <div className="grid gap-4 border-b border-gray-100 p-6 md:grid-cols-4">
            <select value={reservationFilters.zoneId} onChange={(e) => setReservationFilters((p) => ({ ...p, zoneId: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"><option value="">All zones</option>{zones.map((zone) => <option key={zone._id} value={zone._id}>{zone.name}</option>)}</select>
            <select value={reservationFilters.vehicleType} onChange={(e) => setReservationFilters((p) => ({ ...p, vehicleType: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"><option value="">All vehicle types</option><option value="car">Car</option><option value="bike">Bike</option></select>
            <select value={reservationFilters.status} onChange={(e) => setReservationFilters((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"><option value="">All statuses</option><option value="reserved">Reserved</option><option value="occupied">Occupied</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="expired">Expired</option></select>
            <input type="date" value={reservationFilters.date} onChange={(e) => setReservationFilters((p) => ({ ...p, date: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50"><tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">User</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Slot</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Window</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th><th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100">{reservations.map((reservation) => <tr key={reservation._id} className="hover:bg-gray-50"><td className="px-6 py-4"><p className="font-semibold text-gray-800">{reservation.userId?.name || "Unknown user"}</p><p className="text-sm text-gray-500">{reservation.userId?.email || "-"}</p></td><td className="px-6 py-4"><p className="font-semibold text-gray-800">{reservation.slotId?.slotCode || reservation.slotSnapshot?.slotCode || "-"}</p><p className="text-sm text-gray-500">{reservation.zoneId?.name || reservation.zoneSnapshot?.name || "-"}</p></td><td className="px-6 py-4 text-sm text-gray-600"><p>{formatParkingDateTime(reservation.reservationStart)}</p><p>{formatParkingDateTime(reservation.reservationEnd)}</p><p className="mt-1 text-xs text-gray-400">{formatDurationMinutes(reservation.durationMinutes)}</p></td><td className="px-6 py-4"><ParkingStatusBadge status={reservation.status} /></td><td className="px-6 py-4"><div className="flex justify-end gap-2">{reservation.status === "reserved" ? <><button type="button" onClick={() => runAction(() => adminCheckInParkingReservation(reservation._id), "Reservation checked in")} className="rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-500 hover:text-white">Check In</button><button type="button" onClick={() => runAction(() => adminCancelParkingReservation(reservation._id), "Reservation cancelled")} className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-500 hover:text-white">Cancel</button></> : null}{reservation.status === "occupied" ? <button type="button" onClick={() => runAction(() => adminCheckOutParkingReservation(reservation._id), "Reservation checked out")} className="rounded-lg bg-green-100 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-500 hover:text-white">Check Out</button> : null}</div></td></tr>)}</tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">Usage Summary</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Stat label="Current Occupancy" value={usage?.summary?.currentOccupancy || 0} tone="bg-blue-100 text-blue-700" />
              <Stat label="Daily Usage" value={usage?.summary?.dailyUsage || 0} tone="bg-green-100 text-green-700" />
              <Stat label="Zone Count" value={usage?.summary?.zoneCount || 0} tone="bg-amber-100 text-amber-700" />
              <Stat label="Reserved Slots" value={usage?.summary?.reservedSlots || 0} tone="bg-red-100 text-red-700" />
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b border-gray-100 p-6"><h2 className="text-xl font-semibold text-gray-800">Zone-wise Usage</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-yellow-100"><tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Zone</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Total</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Available</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Occupied</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Reserved</th></tr></thead>
                <tbody className="divide-y divide-gray-100">{(usage?.zoneBreakdown || []).map((zone) => <tr key={zone._id} className="hover:bg-gray-50"><td className="px-6 py-4"><p className="font-semibold text-gray-800">{zone.zoneName}</p><p className="text-sm text-gray-500">{zone.zoneCode}</p></td><td className="px-6 py-4 text-sm text-gray-600">{zone.totalSlots}</td><td className="px-6 py-4 text-sm text-gray-600">{zone.availableSlots}</td><td className="px-6 py-4 text-sm text-gray-600">{zone.occupiedSlots}</td><td className="px-6 py-4 text-sm text-gray-600">{zone.reservedSlots}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>

        {isLoading ? <div className="rounded-2xl bg-white p-6 text-sm text-gray-500 shadow-sm">Loading parking dashboard...</div> : null}
      </div>
    </div>
  );
};

export default Parking;
