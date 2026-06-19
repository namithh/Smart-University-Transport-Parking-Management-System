import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getUserIncidents } from "../../services/incidentService";
import IncidentCard from "../../component/incident/IncidentCard";
import { toast } from "react-toastify";

const MyIncidents = () => {
  const user = useSelector((state) => state?.user?.user);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getUserIncidents();
      if (data.success) setIncidents(data.data || []);
      else {
        setError(data.message || "Failed to load");
        toast.error(data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchData();
  }, [user?._id]);

  if (!user?._id) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My incidents</h1>
        <p className="text-gray-600 mb-6">Track status updates for reports you submitted.</p>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : incidents.length === 0 ? (
          <p className="text-gray-500">You have not submitted any incidents yet.</p>
        ) : (
          <div className="space-y-4">
            {incidents.map((inc) => (
              <IncidentCard key={inc._id} incident={inc} showReporter={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyIncidents;
