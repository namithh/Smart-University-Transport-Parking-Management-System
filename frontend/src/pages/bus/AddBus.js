import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/buses";
const DRIVERS_API = process.env.REACT_APP_API_URL || "http://localhost:8000/api/drivers";

const AddBus = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    bus_number: "",
    bus_type: "",
    driver: "",
    total_seats: "",
    available_seats: "",
    route: "",
    departure_time: "",
    arrival_time: ""
  });

  // Fetch drivers from drivers table
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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "total_seats") {
        return { ...prev, total_seats: value, available_seats: value };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(API_URL, formData);
      toast.success("Bus added successfully!");
      setTimeout(() => navigate("/admin-panel/buses"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add bus. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 text-white">
            <h2 className="text-2xl text-center font-bold">Add New Bus</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bus Number</label>
              <input
                type="text"
                name="bus_number"
                placeholder="Enter bus number"
                required
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bus Type</label>
              <select
                name="bus_type"
                required
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Select Bus Type</option>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </div>

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
                  <option key={driver._id} value={driver._id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats</label>
              <input
                type="number"
                name="total_seats"
                placeholder="Enter total seats"
                required
                onChange={handleChange}
                min="1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <input type="hidden" name="available_seats" value={formData.available_seats} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
              <input
                type="text"
                name="route"
                placeholder="Enter route details"
                required
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                <input
                  type="time"
                  name="departure_time"
                  required
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                <input
                  type="time"
                  name="arrival_time"
                  required
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="pt-4 flex space-x-4">
              <button
                type="button"
                onClick={() => navigate("/admin-panel/buses")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg text-white font-medium transition flex-1 ${
                  isSubmitting ? "bg-blue-100 cursor-not-allowed" : "bg-green-400 hover:bg-green-500"
                }`}
              >
                {isSubmitting ? "Processing..." : "Add Bus"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBus;
