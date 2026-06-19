import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/buses";
const DRIVERS_API = process.env.REACT_APP_API_URL || "http://localhost:8000/api/drivers";


const EditBus = () => {
  const { id } = useParams();
    const [drivers, setDrivers] = useState([]); // store drivers here
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bus_number: "",
    bus_type: "",
    driver: "",
    total_seats: "",
    route: "",
    departure_time: "",
    arrival_time: "",
  });

    // Fetch all drivers (same as Driver page but only drivers)
    const fetchDrivers = async () => {
      try {
        const res = await axios.get(DRIVERS_API);
        setDrivers(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch drivers");
      }
    };
  
        
     

  useEffect(() => {
    fetchDrivers();
    axios
      .get(`${API_URL}/${id}`)
      .then((res) => setFormData(res.data))
      .catch((err) => console.error("Error fetching bus:", err));
  }, [id]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${id}`, formData);
      toast.success("Bus updated successfully!");
      navigate("/admin-panel/buses");
    } catch (err) {
      console.error("Error updating bus:", err);
      toast.error("Error updating bus!");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Edit Bus</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow-xl shadow-slate-400 rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Bus Number</label>
        <input
          type="text"
          name="bus_number"
          value={formData.bus_number}
          required
          onChange={handleChange}
          placeholder="Bus Number"
          className="w-full p-2 border rounded-md mb-2"
        />
        <label className="block text-sm font-medium text-gray-700 mb-1">Bus Type</label>
        <input
          type="text"
          name="bus_type"
          value={formData.bus_type}
          required
          onChange={handleChange}
          placeholder="Bus Type"
          className="w-full p-2 border rounded-md mb-2"
        />

        <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
              <select
                name="driver"
                required
                onChange={handleChange}
                value={formData.driver}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver.name}> {/* Changed value to driver.name */}  
                    {driver.name} 
                  </option>
                ))}
              </select>
            </div>


        <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats</label>
        <input
          type="number"
          name="total_seats"
          value={formData.total_seats}
          required
          onChange={handleChange}
          placeholder="Total Seats"
          className="w-full p-2 border rounded-md mb-2"
        />
        <label className="block text-sm font-medium text-gray-700 mb-1">Route Number</label>
        <input
          type="text"
          name="route"
          value={formData.route}
          required
          onChange={handleChange}
          placeholder="Route"
          className="w-full p-2 border rounded-md mb-2"
        />
        <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
        <input
          type="time"
          name="departure_time"
          value={formData.departure_time}
          required
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-2"
        />
        <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
        <input
          type="time"
          name="arrival_time"
          value={formData.arrival_time}
          required
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-2"
        />
        <button
          type="submit"
          className="bg-yellow-500 text-white px-4 py-2 rounded-md w-full"
        >
          Update Bus
        </button>
      </form>
    </div>
  );
};

export default EditBus;
