import React from "react";

const statusStyles = {
  Pending: "bg-amber-100 text-amber-800 border-amber-300",
  Assigned: "bg-blue-100 text-blue-800 border-blue-300",
  Investigating: "bg-purple-100 text-purple-800 border-purple-300",
  Resolved: "bg-green-100 text-green-800 border-green-300",
  Closed: "bg-gray-100 text-gray-700 border-gray-300",
};

const IncidentCard = ({ incident, showReporter }) => {
  const typeLabel =
    incident.type === "other" && incident.customType
      ? `Other (${incident.customType})`
      : incident.type?.charAt(0).toUpperCase() + incident.type?.slice(1);

  return (
    <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full border ${
            statusStyles[incident.status] || statusStyles.Pending
          }`}
        >
          {incident.status}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-2">{incident.description}</p>
      <div className="text-sm text-gray-500 space-y-1">
        <p>
          <span className="font-medium text-gray-700">Type:</span> {typeLabel}
        </p>
        {incident.location ? (
          <p>
            <span className="font-medium text-gray-700">Location:</span> {incident.location}
          </p>
        ) : null}
        {incident.assignedTo ? (
          <p>
            <span className="font-medium text-gray-700">Assigned to:</span> {incident.assignedTo}
          </p>
        ) : null}
        {showReporter && incident.reportedBy && (
          <p>
            <span className="font-medium text-gray-700">Reported by:</span>{" "}
            {incident.reportedBy.name || incident.reportedBy.email}
          </p>
        )}
        <p className="text-xs text-gray-400">
          Reported: {incident.createdAt ? new Date(incident.createdAt).toLocaleString() : "—"}
        </p>
      </div>
    </div>
  );
};

export default IncidentCard;
