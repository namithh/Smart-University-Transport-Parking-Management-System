import { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineSearch, AiOutlineInfoCircle, AiOutlineClockCircle } from "react-icons/ai";
import { BsPeople, BsCurrencyRupee, BsBusFront } from "react-icons/bs";
import { IoLocationOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const API_BUSES = "http://localhost:8000/api/buses";
const API_ROUTES = "http://localhost:8000/api/routes";

export default function BusRouteTable() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBuses();
    fetchRoutes();
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await axios.get(API_BUSES);
      setBuses(res.data);
    } catch (err) {
      toast.error("Failed to fetch buses");
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await axios.get(API_ROUTES);
      setRoutes(res.data);
    } catch (err) {
      toast.error("Failed to fetch routes");
    }
  };

  // Format time for better display
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Calculate duration between departure and arrival
  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return "N/A";
    
    const dep = new Date(`2000-01-01T${departure}`);
    const arr = new Date(`2000-01-01T${arrival}`);
    
    // Handle overnight journeys
    if (arr < dep) {
      arr.setDate(arr.getDate() + 1);
    }
    
    const diffMs = arr - dep;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Merge buses with their route details
  const mergedData = buses.map((bus) => {
    const route =
      routes.find(
        (r) => r._id === bus.route || r.route_name === bus.route
      ) || {};
    return {
      ...bus,
      start: route.start_location || "-",
      end: route.end_location || "-",
      price: route.price || "-",
    };
  });

  // Filter by bus number
  const filteredData = mergedData.filter((bus) =>
    bus.bus_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Shuttles</h2>
        
        {/* Search Bar */}
        <div className=" rounded-lg p-4 mb-6">
          <div className="flex items-center max-w-md mx-auto">
            <div className="relative flex items-center w-full">
              <AiOutlineSearch className="absolute left-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by bus number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-gray-600">
          {filteredData.length} {filteredData.length === 1 ? 'bus' : 'buses'} found
        </div>

        {/* Bus Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((bus) => (
            <div key={bus._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Bus Header */}
              <div className="bg-green-300 text-white p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl text-slate-600 font-bold">{bus.bus_number}</h3>
                    <div className="flex items-center text-slate-600 mt-1 text-sm">
                      <BsBusFront className="mr-1" />
                      <span>{bus.bus_type}</span>
                    </div>
                  </div>
                  <span className="bg-green-600 text-xs px-2 py-1 rounded-full uppercase">
                    {bus.available_seats} Seats
                  </span>
                </div>
              </div>
              
              {/* Route Information */}
              <div className="p-4 border-b">
                <div className="flex items-center mb-3">
                  <IoLocationOutline className="text-green-500 mr-2" />
                  <div className="flex-1">
                    <div className="font-medium">{bus.start}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <AiOutlineClockCircle className="mr-1" />
                      Departure: {formatTime(bus.departure_time)}
                    </div>
                  </div>
                </div>
                
                <div className="h-4 border-l-2 border-dashed border-gray-300 ml-2"></div>
                
                <div className="flex items-center mt-1">
                  <IoLocationOutline className="text-red-500 mr-2" />
                  <div className="flex-1">
                    <div className="font-medium">{bus.end}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <AiOutlineClockCircle className="mr-1" />
                      Arrival: {formatTime(bus.arrival_time)}
                    </div>
                  </div>
                </div>
                
                {/* Duration */}
                <div className="mt-3 bg-gray-100 p-2 rounded-lg text-center">
                  <div className="text-sm text-gray-600">
                    Journey Time: {calculateDuration(bus.departure_time, bus.arrival_time)}
                  </div>
                </div>
              </div>
              
              {/* Bus Details */}
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center text-gray-600">
                  <BsPeople className="mr-1" />
                  <span>{bus.available_seats} seats available</span>
                </div>
                
                <div className="flex items-center text-green-700 font-bold">
                  
                  <span>LKR {bus.price}.00</span>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="px-4 pb-4">
                <Link to={`/book/${bus._id}`}>
                  <button 
                    className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 ${
                      bus.start === "-" || bus.end === "-" 
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                    disabled={bus.start === "-" || bus.end === "-"}
                  >
                    {bus.start === "-" || bus.end === "-" ? "Route Info Missing" : "Book Now"}
                  </button>
                </Link>
                
                {bus.start === "-" || bus.end === "-" && (
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <AiOutlineInfoCircle className="mr-1" />
                    <span>Cannot book without route details</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <AiOutlineSearch size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No buses found</h3>
            <p className="text-gray-500">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  );
}