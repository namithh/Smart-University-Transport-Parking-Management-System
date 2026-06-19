import React, { useEffect, useState } from "react";
import SummaryApi from "../../common";
import {
  createNotification,
  getAllNotifications,
  deleteNotification,
} from "../../services/notificationService";
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";

const NotificationManagement = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [expiryDate, setExpiryDate] = useState("");
  const [audience, setAudience] = useState("all");
  const [targetUserId, setTargetUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const loadUsers = async () => {
    try {
      const res = await fetch(SummaryApi.allUser.url, {
        method: SummaryApi.allUser.method,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setUsers(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadNotifications = async () => {
    setLoadingList(true);
    try {
      const { data } = await getAllNotifications();
      if (data.success) setList(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadNotifications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!expiryDate) {
      toast.error("Please set an expiry date");
      return;
    }
    if (audience === "specific" && !targetUserId) {
      toast.error("Select a user");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        type,
        expiryDate: new Date(expiryDate).toISOString(),
        audience,
        userId: audience === "specific" ? targetUserId : undefined,
      };
      const { data } = await createNotification(payload);
      if (data.success) {
        toast.success(data.message || "Created");
        setTitle("");
        setMessage("");
        setType("info");
        setTargetUserId("");
        await loadNotifications();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      const { data } = await deleteNotification(id);
      if (data.success) {
        toast.success("Deleted");
        await loadNotifications();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Notification management</h1>
        <p className="text-gray-600 text-sm">Broadcast to all students or send to one user.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry date</label>
          <input
            type="datetime-local"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">Audience</span>
          <label className="mr-4">
            <input
              type="radio"
              name="aud"
              checked={audience === "all"}
              onChange={() => setAudience("all")}
            />{" "}
            All users
          </label>
          <label>
            <input
              type="radio"
              name="aud"
              checked={audience === "specific"}
              onChange={() => setAudience("specific")}
            />{" "}
            Specific user
          </label>
        </div>
        {audience === "specific" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              required={audience === "specific"}
            >
              <option value="">— Select user —</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-full font-semibold text-black bg-green-400 hover:bg-green-600 hover:text-white disabled:opacity-50"
        >
          {loading ? "Saving…" : "Create notification"}
        </button>
      </form>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent notifications</h2>
        {loadingList ? (
          <p className="text-gray-500">Loading…</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-green-50 font-semibold text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Audience</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Expires</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((n) => (
                  <tr key={n._id} className="border-t border-gray-100">
                    <td className="px-3 py-2">{n.title}</td>
                    <td className="px-3 py-2">
                      {n.userId ? (n.userId.name || n.userId.email || "User") : "All users"}
                    </td>
                    <td className="px-3 py-2">{n.type}</td>
                    <td className="px-3 py-2">
                      {n.expiryDate ? new Date(n.expiryDate).toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(n._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <MdDelete size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && (
              <p className="p-4 text-center text-gray-500">No notifications created yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement;
