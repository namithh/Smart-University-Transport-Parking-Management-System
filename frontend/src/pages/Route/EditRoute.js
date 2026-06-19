import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/routes";

const EditRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    route_name: "",
    start_location: "",
    end_location: "",
    distance: "",
    duration: "",
    price: "",
    status: "",
  });

  useEffect(() => {
    axios
      .get(`${API_URL}/${id}`)
      .then((res) => setFormData(res.data))
      .catch((err) => console.error("Error fetching route:", err));
  }, [id]);

  // Function to format duration input
  const formatDuration = (value) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  let hours = "";
  let minutes = "";
  let seconds = "";

  if (digits.length <= 2) {
    minutes = digits;
  } else if (digits.length <= 4) {
    hours = digits.slice(0, digits.length - 2);
    minutes = digits.slice(-2);
  } else {
    hours = digits.slice(0, digits.length - 4);
    minutes = digits.slice(-4, -2);
    seconds = digits.slice(-2);
  }

  let result = "";
  if (hours) result += `${parseInt(hours)}h `;
  if (minutes) result += `${parseInt(minutes)}m `;
  if (seconds) result += `${parseInt(seconds)}s`;

  return result.trim();
};

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation rules
    if (name === "route_name" && !/^[0-9]*$/.test(value)) {
      return; // Only digits allowed
    }
    if (
      (name === "start_location" || name === "end_location") &&
      !/^[a-zA-Z\s]*$/.test(value)
    ) {
      return; // Only letters & spaces allowed
    }
    if ((name === "distance" || name === "price") && Number(value) < 0) {
      return; // No negative values
    }
      if (name === "duration") {
    setFormData({ ...formData, [name]: formatDuration(value) });
    return;
  }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${id}`, formData);
      toast.success(" Route updated successfully!");
      navigate("/admin-panel/routes");
    } catch (err) {
      console.error("Error updating route:", err);
      toast.error(" Error updating route!");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-lg">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-green-600">
        Edit Route
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl p-6 border-t-4 border-green-500"
      >
        {/* Route Number */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Route Number
        </label>
        <input
          type="text"
          name="route_name"
          value={formData.route_name}
          required
          onChange={handleChange}
          className="w-full p-3 border rounded-md mb-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          placeholder="Enter Route Number"
        />

        {/* Start Location */}
        <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
          Start Location
        </label>
                    <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, start_location: "SLIIT Malabe" })
              }
              className="text-sm bg-green-100 hover:bg-green-200 text-green-700 font-medium px-3 py-1 rounded-full border border-green-300 mb-2"
            >
               SLIIT
            </button>
        <input
          type="text"
          name="start_location"
          value={formData.start_location}
          required
          onChange={handleChange}
          className="w-full p-3 border rounded-md mb-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          placeholder="Start Location"
        />

        {/* End Location */}
        <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
          End Location
        </label>
                    <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, end_location: "SLIIT Malabe" })
              }
              className="text-sm bg-green-100 hover:bg-green-200 text-green-700 font-medium px-3 py-1 rounded-full border border-green-300 mb-2"
            >
               SLIIT
            </button>
        <input
          type="text"
          name="end_location"
          value={formData.end_location}
          required
          onChange={handleChange}
          className="w-full p-3 border rounded-md mb-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          placeholder="End Location"
        />

        {/* Distance */}
        <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
          Distance (km)
        </label>
        <input
          type="number"
          name="distance"
          value={formData.distance}
          required
          onChange={handleChange}
          className="w-full p-3 border rounded-md mb-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          placeholder="Distance (km)"
          min="0"
        />

        {/* Duration */}
        <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
          Duration
        </label>
        <input
          type="text"
          name="duration"
          value={formData.duration}
          required
          onChange={handleChange}
          className="w-full p-3 border rounded-md mb-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          placeholder="Duration (e.g. 2h 30m)"
        />

        {/* Price */}
        <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
          Price (Rs)
        </label>
        <input
          type="number"
          name="price"
          value={formData.price}
          required
          onChange={handleChange}
          className="w-full p-3 border rounded-md mb-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          placeholder="Price (Rs)"
          min="0"
        />

        {/* Status */}
        <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          required
          onChange={handleChange}
          className="w-full p-3 border rounded-md mb-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
        >
          <option value="">Select Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-3 rounded-md w-full transition-all duration-300 transform hover:scale-105"
        >
          Update Route
        </button>
      </form>
    </div>
  );
};

export default EditRoute;