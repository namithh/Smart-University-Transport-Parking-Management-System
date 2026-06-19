import React, { useEffect, useState, useRef } from "react";
import { FaBell } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getUserNotifications, markNotificationRead } from "../../services/notificationService";
import NotificationCard from "./NotificationCard";
import { toast } from "react-toastify";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getUserNotifications();
      if (data.success) setItems(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = items.filter((n) => !n.isReadForUser).length;

  const handleMarkRead = async (id) => {
    try {
      const { data } = await markNotificationRead(id);
      if (data.success) {
        await load();
      } else {
        toast.error(data.message || "Could not update");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update");
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) load();
        }}
        className="relative p-2 rounded-full hover:bg-gray-100 text-gray-800"
        aria-label="Notifications"
      >
        <FaBell className="text-2xl" />
        {unread > 0 && (
          <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-green-50">
            <span className="font-semibold text-gray-800">Notifications</span>
            <Link
              to="/notifications"
              className="text-sm text-green-700 hover:underline"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
          <div className="p-2 space-y-2">
            {loading && items.length === 0 ? (
              <p className="text-sm text-gray-500 p-3">Loading…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-gray-500 p-3">No notifications</p>
            ) : (
              items.slice(0, 8).map((n) => (
                <NotificationCard
                  key={n._id}
                  notification={n}
                  compact
                  onMarkRead={handleMarkRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
