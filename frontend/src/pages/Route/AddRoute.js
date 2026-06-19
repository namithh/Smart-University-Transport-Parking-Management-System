import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/routes";

const AddRoute = () => {
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

  const [errors, setErrors] = useState({
    route_name: "",
    start_location: "",
    end_location: "",
    distance: "",
    duration: "",
    price: "",
    status: "",
  });

  const [touched, setTouched] = useState({
    route_name: false,
    start_location: false,
    end_location: false,
    distance: false,
    duration: false,
    price: false,
    status: false,
  });

  // Handle input changes with restrictions
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Restrict inputs
    if (name === "route_name") {
      if (!/^\d*$/.test(value)) return; // only digits
    }

    if (name === "start_location" || name === "end_location") {
      if (!/^[A-Za-z\s]*$/.test(value)) return; // only letters + spaces
    }

    setFormData({ ...formData, [name]: newValue });

    if (touched[name]) {
      validateField(name, newValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMsg = "";

    switch (name) {
      case "route_name":
        if (!value.trim()) errorMsg = "Route number is required";
        else if (!/^[0-9]+$/.test(value)) errorMsg = "Must be numbers only";
        else if (parseInt(value, 10) <= 0)
          errorMsg = "Route number must be greater than 0";
        break;

      case "start_location":
      case "end_location":
        if (!value.trim()) errorMsg = "Location is required";
        else if (!/^[A-Za-z\s]+$/.test(value))
          errorMsg = "Only letters are allowed";
        break;

      case "distance":
        if (!value) errorMsg = "Distance is required";
        else if (parseFloat(value) <= 0)
          errorMsg = "Distance must be greater than 0";
        break;

      case "duration":
        if (!value.trim()) errorMsg = "Duration is required";
        else if (!/^(\d+h\s*)?(\d+m)?$/.test(value))
          errorMsg = "Format: 2h 30m";
        break;

      case "price":
        if (!value) errorMsg = "Price is required";
        else if (parseFloat(value) <= 0)
          errorMsg = "Price must be greater than 0";
        break;

      case "status":
        if (!value) errorMsg = "Please select a status";
        break;

      default:
        break;
    }

    setErrors({ ...errors, [name]: errorMsg });
    return errorMsg === "";
  };

  const validateForm = () => {
    const newTouched = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      newTouched[key] = true;
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });

    setTouched(newTouched);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      await axios.post(API_URL, formData);
      toast.success("Bus Route added successfully!");
      setTimeout(() => navigate("/admin-panel/routes"), 2000);
    } catch (err) {
      console.error("Error adding route:", err);
      toast.error("Failed to add bus route. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-500 py-4 px-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <i className="fas fa-route mr-2"></i>
            Add Bus Route
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* Route Number */}
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2">
              <i className="fas fa-signature text-amber-500 mr-2"></i>
              Route Number
            </label>
            <input
              type="text"
              name="route_name"
              placeholder="e.g., 101"
              value={formData.route_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.route_name
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-amber-300"
              }`}
            />
            {errors.route_name && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.route_name}
              </p>
            )}
          </div>

          {/* Start Location */}
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2">
              <i className="fas fa-map-marker-alt text-amber-500 mr-2"></i>
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
              placeholder="e.g., Central Station"
              value={formData.start_location}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.start_location
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-amber-300"
              }`}
            />
            {errors.start_location && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.start_location}
              </p>
            )}
          </div>

          {/* End Location */}
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2">
              <i className="fas fa-map-marker-alt text-amber-500 mr-2"></i>
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
              placeholder="e.g., Downtown Terminal"
              value={formData.end_location}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.end_location
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-amber-300"
              }`}
            />
            {errors.end_location && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.end_location}
              </p>
            )}
          </div>

          {/* Distance */}
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2">
              <i className="fas fa-road text-amber-500 mr-2"></i>
              Distance (km)
            </label>
            <input
              type="number"
              name="distance"
              placeholder="e.g., 45"
              value={formData.distance}
              onChange={handleChange}
              onBlur={handleBlur}
              min="0"
              step="0.1"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.distance
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-amber-300"
              }`}
            />
            {errors.distance && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.distance}
              </p>
            )}
          </div>

          {/* Duration */}
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2">
              <i className="fas fa-clock text-amber-500 mr-2"></i>
              Duration
            </label>
            <input
              type="text"
              name="duration"
              placeholder="e.g., 2h 30m"
              value={formData.duration}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.duration
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-amber-300"
              }`}
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.duration}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2">
              <i className="fas fa-tag text-amber-500 mr-2"></i>
              Price (Rs)
            </label>
            <input
              type="number"
              name="price"
              placeholder="e.g., 350"
              value={formData.price}
              onChange={handleChange}
              onBlur={handleBlur}
              min="0"
              step="0.01"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.price
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-amber-300"
              }`}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.price}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              <i className="fas fa-toggle-on text-amber-500 mr-2"></i>
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.status
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-amber-300"
              }`}
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.status}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              <i className="fas fa-plus-circle mr-2"></i>
              Add Route
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin-panel/routes")}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              <i className="fas fa-times mr-2"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoute;