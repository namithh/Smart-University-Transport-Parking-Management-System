import React, { useEffect, useState } from "react";
import {
  getAllIncidents,
  assignIncident,
  updateIncidentStatus,
  deleteIncident,
} from "../../services/incidentService";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MdDelete, MdDownload } from "react-icons/md";

const OFFICERS = ["Transport Officer", "Parking Security Officer"];
const STATUSES = ["Pending", "Assigned", "Investigating", "Resolved", "Closed"];

const IncidentList = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllIncidents();
      if (data.success) setIncidents(data.data || []);
      else toast.error(data.message || "Failed to load incidents");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAssign = async (id, assignedTo) => {
    if (!assignedTo) return;
    setAssigning((s) => ({ ...s, [id]: true }));
    try {
      const { data } = await assignIncident(id, assignedTo);
      if (data.success) {
        toast.success(data.message || "Assigned");
        await load();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Assign failed");
    } finally {
      setAssigning((s) => ({ ...s, [id]: false }));
    }
  };

  const handleStatus = async (id, status) => {
    try {
      const { data } = await updateIncidentStatus(id, status);
      if (data.success) {
        toast.success(data.message || "Status updated");
        await load();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this incident?")) return;
    try {
      const { data } = await deleteIncident(id);
      if (data.success) {
        toast.success("Deleted");
        await load();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const filterByPeriod = (list, mode) => {
    const now = new Date();
    if (mode === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return list.filter((i) => {
        const d = new Date(i.createdAt);
        return d >= start && d <= now;
      });
    }
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return list.filter((i) => {
      const d = new Date(i.createdAt);
      return d >= start && d <= end;
    });
  };

  const generateReport = (mode) => {
    const filtered = filterByPeriod(incidents, mode);
    if (filtered.length === 0) {
      toast.error("No incidents in the selected period");
      return;
    }

    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    doc.setFontSize(25);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(245, 158, 11);
    doc.text("UTPMS", 105, 25, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text("University Transport & Parking System", 105, 32, { align: "center" });
    doc.text(
      mode === "week" ? "Incident Report (last 7 days)" : "Incident Report (this month)",
      105,
      37,
      { align: "center" }
    );

    doc.setLineWidth(0.5);
    doc.setDrawColor(245, 158, 11);
    doc.line(14, 43, 196, 43);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INCIDENT LOG", 105, 55, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Report Generated: ${currentDate}`, 14, 62);
    doc.text(`Records: ${filtered.length}`, 160, 62, { align: "right" });

    const tableColumn = ["Title", "Type", "Status", "Location", "Reporter", "Date"];
    const tableRows = filtered.map((row) => [
      row.title?.substring(0, 40) || "",
      row.type === "other" ? `Other (${row.customType || ""})` : row.type,
      row.status,
      row.location || "—",
      row.reportedBy?.name || row.reportedBy?.email || "—",
      row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 68,
    });

    let finalY = doc.lastAutoTable?.finalY || 68;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(".................................", 14, finalY + 30);
    doc.text("Authorized Signature", 14, finalY + 40);
    doc.text(".................................", 140, finalY + 30);
    doc.text("Checked By", 148, finalY + 40);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("System Generated Report – UTPMS", 105, 290, { align: "center" });

    doc.save(`incidents-report-${mode}-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF generated");
  };

  const badge = (status) => {
    const map = {
      Pending: "bg-amber-100 text-amber-800",
      Assigned: "bg-blue-100 text-blue-800",
      Investigating: "bg-purple-100 text-purple-800",
      Resolved: "bg-green-100 text-green-800",
      Closed: "bg-gray-100 text-gray-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Incident management</h1>
          <p className="text-gray-600 text-sm">Assign officers, update status, export reports.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => generateReport("week")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm"
          >
            <MdDownload /> Weekly report
          </button>
          <button
            type="button"
            onClick={() => generateReport("month")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium text-sm"
          >
            <MdDownload /> Monthly report
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-green-50 text-gray-700 font-semibold">
              <tr>
                <th className="px-3 py-3">Title</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Reporter</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Assign</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Badge</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 max-w-[180px]">{inc.title}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {inc.type === "other" ? `Other (${inc.customType || ""})` : inc.type}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {inc.reportedBy?.name || inc.reportedBy?.email || "—"}
                  </td>
                  <td className="px-3 py-2 max-w-[120px]">{inc.location || "—"}</td>
                  <td className="px-3 py-2">
                    <select
                      className="border rounded-md px-2 py-1 text-xs max-w-[160px]"
                      value={inc.assignedTo || ""}
                      disabled={assigning[inc._id]}
                      onChange={(e) => handleAssign(inc._id, e.target.value)}
                    >
                      <option value="">— Select —</option>
                      {OFFICERS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="border rounded-md px-2 py-1 text-xs"
                      value={inc.status}
                      onChange={(e) => handleStatus(inc._id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${badge(
                        inc.status
                      )}`}
                    >
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(inc._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {incidents.length === 0 && (
            <p className="p-6 text-center text-gray-500">No incidents yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default IncidentList;
