const PARKING_TIMEZONE = "Asia/Colombo";
const SLOT_STATUSES = ["available", "occupied", "reserved", "unavailable", "maintenance"];
const MANUAL_SLOT_STATUSES = ["available", "unavailable", "maintenance"];
const RESERVATION_STATUSES = ["reserved", "occupied", "completed", "cancelled", "expired"];
const ACTIVE_RESERVATION_STATUSES = ["reserved", "occupied"];
const VEHICLE_TYPES = ["car", "bike"];
const ZONE_STATUSES = ["active", "inactive"];
const USAGE_ACTIONS = [
  "zone_created",
  "zone_updated",
  "zone_deleted",
  "slot_created",
  "slot_updated",
  "slot_deleted",
  "slot_status_changed",
  "reservation_created",
  "reservation_cancelled",
  "reservation_expired",
  "reservation_checked_in",
  "reservation_checked_out",
];

const DEFAULT_RESERVATION_HOLD_MINUTES = Number(
  process.env.PARKING_RESERVATION_HOLD_MINUTES || 30
);

module.exports = {
  ACTIVE_RESERVATION_STATUSES,
  DEFAULT_RESERVATION_HOLD_MINUTES,
  MANUAL_SLOT_STATUSES,
  PARKING_TIMEZONE,
  RESERVATION_STATUSES,
  SLOT_STATUSES,
  USAGE_ACTIONS,
  VEHICLE_TYPES,
  ZONE_STATUSES,
};
