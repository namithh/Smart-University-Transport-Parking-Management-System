import React, { useState } from "react";
import { createIncident } from "../../services/incidentService";
import { toast } from "react-toastify";

const IncidentForm = ({ onSuccess }) => {
  const [type, setType] = useState("transport");
  const [customType, setCustomType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === "other" && !customType.trim()) {
      toast.error("Please specify the incident type.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        location: location.trim(),
      };
      if (type === "other") payload.customType = customType.trim();

      const { data } = await createIncident(payload);
      if (data.success) {
        toast.success(data.message || "Incident submitted");
        setTitle("");
        setDescription("");
        setLocation("");
        setCustomType("");
        setType("transport");
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || "Failed to submit");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Incident type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="transport">Transport</option>
          <option value="parking">Parking</option>
          <option value="other">Other</option>
        </select>
      </div>

      {type === "other" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specify type</label>
          <input
            type="text"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Describe the category"
            required={type === "other"}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 rounded-full font-semibold text-black bg-green-400 hover:bg-green-600 hover:text-white disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit incident"}
      </button>
    </form>
  );
};

export default IncidentForm;
