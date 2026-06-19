import React from "react";

const typeStyles = {
  info: "border-l-4 border-blue-500 bg-blue-50/50",
  warning: "border-l-4 border-amber-500 bg-amber-50/50",
  emergency: "border-l-4 border-red-600 bg-red-50/80",
};

const NotificationCard = ({ notification, onMarkRead, compact }) => {
  const read = notification.isReadForUser === true;
  const cls = typeStyles[notification.type] || typeStyles.info;

  return (
    <div
      className={`rounded-lg p-3 ${cls} ${!read ? "ring-1 ring-green-400/40" : ""} ${
        compact ? "text-sm" : ""
      }`}
    >
      <div className="flex justify-between gap-2 items-start">
        <div>
          <p className={`font-semibold text-gray-900 ${read ? "opacity-75" : ""}`}>
            {notification.title}
          </p>
          <p className="text-gray-700 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-2">
            {notification.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : ""}
            {notification.expiryDate && (
              <span className="ml-2">
                · Expires {new Date(notification.expiryDate).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        {!read && onMarkRead && (
          <button
            type="button"
            onClick={() => onMarkRead(notification._id)}
            className="shrink-0 text-xs font-medium text-green-700 hover:text-green-900 underline"
          >
            Mark read
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
