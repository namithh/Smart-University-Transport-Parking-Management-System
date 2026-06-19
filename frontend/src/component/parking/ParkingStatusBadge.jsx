import React from "react";
import { reservationStatusClasses } from "../../lib/parking";

const ParkingStatusBadge = ({ status }) => {
  const normalizedStatus = String(status || "inactive").toLowerCase();
  const className =
    reservationStatusClasses[normalizedStatus] || "bg-gray-200 text-gray-700";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${className}`}>
      {normalizedStatus.replace("-", " ")}
    </span>
  );
};

export default ParkingStatusBadge;
