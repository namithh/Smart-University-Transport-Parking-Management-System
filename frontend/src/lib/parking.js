export const PARKING_TIMEZONE = "Asia/Colombo";
export const PARKING_TIMEZONE_LABEL = "Sri Lanka time (Asia/Colombo)";
export const CAMPUS_UTC_OFFSET_MINUTES = 330;
export const PARKING_POLLING_INTERVAL_MS = 15000;

const pad = (value) => String(value).padStart(2, "0");

const dateToCampusParts = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const shifted = new Date(date.getTime() + CAMPUS_UTC_OFFSET_MINUTES * 60000);
  return {
    year: shifted.getUTCFullYear(),
    month: pad(shifted.getUTCMonth() + 1),
    day: pad(shifted.getUTCDate()),
    hour: pad(shifted.getUTCHours()),
    minute: pad(shifted.getUTCMinutes()),
  };
};

export const campusInputToIso = (value) => {
  if (!value) return null;
  const normalized = value.length === 16 ? `${value}:00` : value;
  const campusDate = new Date(`${normalized}+05:30`);
  return Number.isNaN(campusDate.getTime()) ? null : campusDate.toISOString();
};

export const isoToCampusInput = (value) => {
  const parts = dateToCampusParts(value);
  if (!parts) return "";
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

export const nowCampusInput = () => isoToCampusInput(new Date());

export const campusDateAndTimeToIso = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) return null;
  return campusInputToIso(`${dateValue}T${timeValue}`);
};

export const campusDateFromIso = (value) => {
  const campusInput = isoToCampusInput(value);
  return campusInput ? campusInput.split("T")[0] : "";
};

export const campusTimeFromIso = (value) => {
  const campusInput = isoToCampusInput(value);
  return campusInput ? campusInput.split("T")[1] : "";
};

export const getDefaultParkingSearchWindow = () => {
  const now = new Date();
  const roundedMinutes = Math.ceil(now.getMinutes() / 30) * 30;
  now.setMinutes(roundedMinutes, 0, 0);
  const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  return {
    bookingDate: campusDateFromIso(now.toISOString()),
    startTime: campusTimeFromIso(now.toISOString()),
    endTime: campusTimeFromIso(end.toISOString()),
  };
};

export const formatParkingDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: PARKING_TIMEZONE,
  }).format(date);
};

export const formatParkingDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeZone: PARKING_TIMEZONE,
  }).format(date);
};

export const formatDurationMinutes = (value) => {
  const minutes = Number(value || 0);
  if (!Number.isFinite(minutes) || minutes <= 0) return "0 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
};

export const reservationStatusClasses = {
  active: "bg-green-100 text-green-700",
  available: "bg-green-100 text-green-700",
  occupied: "bg-blue-100 text-blue-700",
  reserved: "bg-amber-100 text-amber-700",
  unavailable: "bg-red-100 text-red-700",
  maintenance: "bg-slate-200 text-slate-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  expired: "bg-gray-200 text-gray-700",
  inactive: "bg-gray-200 text-gray-700",
};
