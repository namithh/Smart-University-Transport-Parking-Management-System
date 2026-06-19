import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getUserNotifications, markNotificationRead } from "../../services/notificationService";
import NotificationCard from "../../component/incident/NotificationCard";
import { toast } from "react-toastify";

const Notifications = () => {
  const user = useSelector((state) => state?.user?.user);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getUserNotifications();
      if (data.success) setItems(data.data || []);
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
    if (user?._id) load();
  }, [user?._id]);

  const onMarkRead = async (id) => {
    try {
      const { data } = await markNotificationRead(id);
      if (data.success) await load();
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  if (!user?._id) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Notifications</h1>
        <p className="text-gray-600 mb-6">
          Active messages (expired items are hidden automatically).
        </p>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">No notifications right now.</p>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <NotificationCard key={n._id} notification={n} onMarkRead={onMarkRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
