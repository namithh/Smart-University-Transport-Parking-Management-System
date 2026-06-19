import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GrAdd } from "react-icons/gr";
import { MdEdit, MdOutlineRoute, MdClose, MdFileDownload } from "react-icons/md";
import { AiFillDelete, AiOutlineSearch,  } from "react-icons/ai";
import { IoLocationOutline, IoTimeOutline, IoSpeedometerOutline } from "react-icons/io5";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



// Leaflet CSS
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import Leaflet components
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const busStopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map updater component
function MapUpdater({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = new L.LatLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, coordinates]);

  return null;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/routes";



const RouteList = () => {
  const [routes, setRoutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  // Generate PDF of routes
  // PDF Export function
const generatePDF = () => {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

  //Header

  doc.setFontSize(25);
      doc.setFont("helvetica", "bolditalic");
      doc.setTextColor(245, 158, 11); // amber-500 (yellow tone)
      doc.text("UTPMS", 105, 25, { align: "center" });

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text("University Transport & Parking System", 105, 32, { align: "center" });
      doc.text(`Bus Routes Report`, 105, 37, { align: "center" });

      doc.setLineWidth(0.5);
      doc.setDrawColor(245, 158, 11); // amber-500
      doc.line(14, 43, 196, 43);

      // Summary Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("BUS ROUTES", 105, 60, { align: "center" });



  // Table headers & rows
  const tableColumn = ["Route Name", "From", "To", "Distance (km)", "Duration", "Price (Rs.)", "Status"];
  const tableRows = [];

  routes.forEach(route => {
    const routeData = [
      route.route_name,
      route.start_location,
      route.end_location,
      route.distance,
      formatDuration(route.duration),
      route.price,
      route.status,
    ];
    tableRows.push(routeData);
  });

  doc.setFontSize(10);
      doc.setFont("helvetica");
  
        doc.text(`Report Generated: ${currentDate}`, 14, 55);

  // AutoTable
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 66,
  });

  // Get final Y position of table
let finalY = doc.lastAutoTable.finalY || 66;

// Signature / Approval Section
doc.setFontSize(12);
doc.setFont("helvetica", "normal");
doc.text(".................................", 14, finalY + 30);
doc.text("Authorized Signature", 14, finalY + 40);

doc.text(".................................", 140, finalY + 30);
doc.text("Checked By", 148, finalY + 40);

// Footer
doc.setFontSize(9);
doc.setTextColor(100);
doc.text("System Generated Report – UTPMS", 105, 290, { align: "center" });


  // Save PDF
  doc.save("bus_routes_report.pdf");
};

//------------------------------------------------------pdf end---------------------------------

  // Map modal state
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [busStops, setBusStops] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(API_URL)
      .then(res => {
        setRoutes(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching routes:", err);
        setLoading(false);
        toast.error("Failed to load routes");
      });
  }, []);

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = 
      route.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.start_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.end_location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || route.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this route?");
    if (isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setRoutes(routes.filter(route => route._id !== id));
        toast.success("Route deleted successfully!");
      } catch (err) {
        console.error("Error deleting route:", err);
        toast.error("Error deleting route!");
      }
    } else {
      toast.info("Route deletion canceled.");
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    if (/^(\d{1,2}):(\d{2})$/.test(duration)) {
      const [hours, minutes] = duration.split(':');
      return `${hours}h ${minutes}m`;
    }
    return duration;
  };

  // Geocode location using Nominatim (OpenStreetMap)
  const geocodeLocation = async (location) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: location + ', Sri Lanka',
            format: 'json',
            limit: 1
          }
        }
      );

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return [parseFloat(lat), parseFloat(lon)];
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  // Get actual road route using OSRM (Open Source Routing Machine)
  const getRoadRoute = async (startLocation, endLocation) => {
    try {
      setMapLoading(true);
      
      // Geocode both locations
      const startCoords = await geocodeLocation(startLocation);
      const endCoords = await geocodeLocation(endLocation);

      if (!startCoords || !endCoords) {
        throw new Error("Could not geocode locations");
      }

      // Get route from OSRM
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}`,
        {
          params: {
            overview: 'full',
            geometries: 'geojson'
          }
        }
      );

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const geometry = response.data.routes[0].geometry;
        // Convert GeoJSON coordinates to Leaflet format [lat, lng]
        const coordinates = geometry.coordinates.map(coord => [coord[1], coord[0]]);
        return coordinates;
      }
      
      throw new Error("No route found");
    } catch (error) {
      console.error("Routing error:", error);
      
      // Fallback: Use straight line with intermediate points
      const startCoords = await geocodeLocation(startLocation) || [6.9271, 79.8612];
      const endCoords = await geocodeLocation(endLocation) || [7.2906, 80.6337];
      
      return [startCoords, endCoords];
    } finally {
      setMapLoading(false);
    }
  };

  // Generate intermediate bus stops automatically
  const generateBusStops = (coordinates, numStops = 5) => {
    if (!coordinates || coordinates.length < 2) return [];
    const interval = Math.floor(coordinates.length / (numStops + 1));
    const stops = [];
    for (let i = 1; i <= numStops; i++) {
      stops.push(coordinates[i * interval]);
    }
    return stops;
  };

  // Open Map in popup modal
  const openMap = async (route) => {
    setSelectedRoute(route);
    setIsMapOpen(true);
    
    // Get actual road route
    const roadCoordinates = await getRoadRoute(route.start_location, route.end_location);
    setRouteCoordinates(roadCoordinates);

    const stops = generateBusStops(roadCoordinates, 5); // 5 bus stops
    setBusStops(stops);

  };

  const closeMap = () => {
    setIsMapOpen(false);
    setSelectedRoute(null);
    setRouteCoordinates([]);
    setBusStops([]);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
  <div className="flex items-center mb-4 md:mb-0">
    <MdOutlineRoute className="text-3xl text-blue-600 mr-2" />
    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Bus Routes</h2>
  </div>

  {/* Buttons wrapper */}
  <div className="flex items-center">
    <Link to="/admin-panel/routes/add">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-md">
        <GrAdd className="text-lg" /> Add New Route
      </button>
    </Link>

    <button
      onClick={generatePDF}
      className="bg-green-500 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-md ml-3"
    >
      <MdFileDownload className="text-lg" /> Generate PDF
    </button>
  </div>
</div>


      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AiOutlineSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search routes by name or location..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-48">
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Routes Table */}
      {filteredRoutes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <MdOutlineRoute className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm || statusFilter !== "All" ? "No routes match your criteria" : "No routes available"}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== "All" ? "Try adjusting your search or filter" : "Get started by adding a new route"}
          </p>
          {!searchTerm && statusFilter === "All" && (
            <Link to="/admin-panel/routes/add">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center gap-2">
                <GrAdd /> Add Your First Route
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className=" bg-yellow-100 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route Details</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoutes.map(route => (
                  <tr key={route._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <MdOutlineRoute className="text-blue-600 text-xl" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{route.route_name}</div>
                          <div className="flex items-center text-base text-gray-500 mt-1">
                            <IoLocationOutline className="mr-1 text-green-500" />
                            <span>{route.start_location} → {route.end_location}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-sm text-gray-900">
                        <IoSpeedometerOutline className="mr-1 text-purple-500" />
                        <span className="font-semibold">{route.distance} km</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center font-semibold text-sm text-gray-900">
                        <IoTimeOutline className="mr-1 text-yellow-500" />
                        <span>{formatDuration(route.duration)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-sm"> Rs . {route.price}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${route.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {route.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Link to={`/admin-panel/routes/edit/${route._id}`}>
                          <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-md flex items-center gap-2 transition-colors text-base">
                            <MdEdit /> Edit
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(route._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md flex items-center gap-2 transition-colors text-base"
                        >
                          <AiFillDelete /> Delete
                        </button>
                        <button 
                          onClick={() => openMap(route)}
                          className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-md flex items-center gap-2 transition-colors text-base"
                        >
                          <IoLocationOutline />Map
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {isMapOpen && selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedRoute.route_name} Route Map
              </h3>
              <button
                onClick={closeMap}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <MdClose className="text-2xl" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <p className="text-gray-600"><strong>From:</strong> {selectedRoute.start_location}</p>
                <p className="text-gray-600"><strong>To:</strong> {selectedRoute.end_location}</p>
                <p className="text-gray-600"><strong>Distance:</strong> {selectedRoute.distance} km</p>
                <p className="text-gray-600"><strong>Duration:</strong> {formatDuration(selectedRoute.duration)}</p>
              </div>
              
              <div className="relative w-full h-96 rounded-lg overflow-hidden border">
                {mapLoading ? (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading actual road route...</p>
                    </div>
                  </div>
            ) : (
              <MapContainer
                center={routeCoordinates[0] || [6.9271, 79.8612]}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />

                <MapUpdater coordinates={routeCoordinates} />

                {/* Route Line */}
                {routeCoordinates.length > 0 && (
                  <Polyline positions={routeCoordinates} color="blue" weight={5} />
                )}

                {/* Start & End markers */}
                {routeCoordinates.length > 0 && (
                  <>
                    <Marker position={routeCoordinates[0]} icon={startIcon}>
                      <Popup>Start: {selectedRoute.start_location}</Popup>
                    </Marker>
                    <Marker position={routeCoordinates[routeCoordinates.length - 1]} icon={endIcon}>
                      <Popup>End: {selectedRoute.end_location}</Popup>
                    </Marker>
                  </>
                )}

                {/* Bus Stops */}
                {busStops.map((stop, index) => (
                  <Marker key={index} position={stop} icon={busStopIcon}>
                    <Popup>Bus Stop {index + 1}</Popup>
                  </Marker>
                ))}
              </MapContainer>
                )}
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Showing actual road routes using OpenStreetMap data</p>
                <button
                  onClick={() => {
                    const origin = encodeURIComponent(selectedRoute.start_location);
                    const destination = encodeURIComponent(selectedRoute.end_location);
                    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`, '_blank');
                  }}
                  className="text-blue-600 hover:text-blue-800 underline text-sm mt-2"
                >
                  View on Google Maps
                </button>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={closeMap}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteList;