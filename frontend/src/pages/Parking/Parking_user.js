import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaCheckCircle, FaClock, FaParking, FaSearch, FaSyncAlt, FaTimesCircle } from "react-icons/fa";
import ParkingReservationModal from "../../component/parking/ParkingReservationModal";
import ParkingStatusBadge from "../../component/parking/ParkingStatusBadge";
import {
  PARKING_POLLING_INTERVAL_MS,
  PARKING_TIMEZONE_LABEL,
  campusDateAndTimeToIso,
  formatParkingDateTime,
  getDefaultParkingSearchWindow,
} from "../../lib/parking";
import {
  cancelParkingReservation,
  checkInParkingReservation,
  checkOutParkingReservation,
  createParkingReservation,
  fetchMyParkingReservations,
  fetchParkingOverview,
} from "../../services/parkingService";

const CountCard = ({ label, value, tone }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`rounded-2xl p-4 ${tone}`}><FaParking /></div>
    </div>
  </div>
);

const ParkingUser = () => {
  const user = useSelector((state) => state?.user?.user);
  const defaults = getDefaultParkingSearchWindow();
  const [searchForm, setSearchForm] = useState({
    zoneId: "",
    vehicleType: "",
    availability: "",
    bookingDate: defaults.bookingDate,
    startTime: defaults.startTime,
    endTime: defaults.endTime,
  });
  const [filters, setFilters] = useState(() => {
    const reservationStart = campusDateAndTimeToIso(defaults.bookingDate, defaults.startTime);
    const reservationEnd = campusDateAndTimeToIso(defaults.bookingDate, defaults.endTime);
    return { zoneId: "", vehicleType: "", availability: "", reservationStart, reservationEnd };
  });
  const [overview, setOverview] = useState({ zones: [], slots: [], counts: {}, selectedRange: null });
  const [reservations, setReservations] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (mounted) setIsLoading(true);
        const [overviewData, myData] = await Promise.all([
          fetchParkingOverview(filters),
          user?._id ? fetchMyParkingReservations() : Promise.resolve([]),
        ]);
        if (!mounted) return;
        setOverview(overviewData);
        setReservations(myData);
      } catch (error) {
        if (mounted) toast.error(error.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    const intervalId = setInterval(load, PARKING_POLLING_INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [filters, refreshKey, user?._id]);

  const currentReservation = reservations
    .filter((item) => ["reserved", "occupied"].includes(item.status))
    .sort((a, b) => new Date(a.reservationStart) - new Date(b.reservationStart))[0];

  const handleSearch = (event) => {
    event.preventDefault();
    const reservationStart = campusDateAndTimeToIso(searchForm.bookingDate, searchForm.startTime);
    const reservationEnd = campusDateAndTimeToIso(searchForm.bookingDate, searchForm.endTime);

    if (!reservationStart || !reservationEnd) {
      toast.error("Please select a valid booking date and time range");
      return;
    }

    if (new Date(reservationEnd) <= new Date(reservationStart)) {
      toast.error("End time must be later than start time");
      return;
    }

    setFilters({
      zoneId: searchForm.zoneId,
      vehicleType: searchForm.vehicleType,
      availability: searchForm.availability,
      reservationStart,
      reservationEnd,
    });
  };

  const handleLifecycle = async (type, reservationId) => {
    try {
      setIsActionLoading(true);
      if (type === "cancel") await cancelParkingReservation(reservationId);
      if (type === "check-in") await checkInParkingReservation(reservationId);
      if (type === "check-out") await checkOutParkingReservation(reservationId);
      toast.success("Parking reservation updated");
      setRefreshKey((value) => value + 1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReserve = async (payload) => {
    try {
      setIsActionLoading(true);
      await createParkingReservation(payload);
      toast.success("Parking slot reserved");
      setSelectedSlot(null);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const counts = overview.counts || {};

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-24">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Campus Parking</p>
              <h1 className="mt-1 text-3xl font-bold text-gray-800">Time-Based Parking Reservations</h1>
              <p className="mt-2 text-sm text-gray-500">{PARKING_TIMEZONE_LABEL}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/parking-user/my-reservations" className="rounded-xl bg-blue-100 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-500 hover:text-white">My Reservations</Link>
              <button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="inline-flex items-center gap-2 rounded-xl bg-green-400 px-4 py-3 text-sm font-semibold text-black shadow-md hover:bg-green-500 hover:text-white"><FaSyncAlt /> Refresh</button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-700"><FaSearch /></div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Search Slot Availability</h2>
              <p className="text-sm text-gray-500">Check availability for an exact booking date and time range.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <select value={searchForm.zoneId} onChange={(e) => setSearchForm((p) => ({ ...p, zoneId: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"><option value="">All zones</option>{overview.zones.map((zone) => <option key={zone._id} value={zone._id}>{zone.name} ({zone.code})</option>)}</select>
            <select value={searchForm.vehicleType} onChange={(e) => setSearchForm((p) => ({ ...p, vehicleType: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"><option value="">All vehicle types</option><option value="car">Car</option><option value="bike">Bike</option></select>
            <input type="date" value={searchForm.bookingDate} onChange={(e) => setSearchForm((p) => ({ ...p, bookingDate: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" required />
            <input type="time" value={searchForm.startTime} onChange={(e) => setSearchForm((p) => ({ ...p, startTime: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" required />
            <input type="time" value={searchForm.endTime} onChange={(e) => setSearchForm((p) => ({ ...p, endTime: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" required />
            <select value={searchForm.availability} onChange={(e) => setSearchForm((p) => ({ ...p, availability: e.target.value }))} className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"><option value="">All results</option><option value="available">Available only</option><option value="reserved">Reserved</option><option value="occupied">Occupied</option><option value="unavailable">Unavailable</option><option value="maintenance">Maintenance</option></select>
          </div>
          <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-400 px-5 py-3 text-sm font-semibold text-black shadow-md hover:bg-green-500 hover:text-white"><FaSearch /> Search Availability</button>
        </form>

        {currentReservation ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Upcoming / Active Reservation</p>
                <h2 className="mt-1 text-2xl font-bold text-gray-800">{currentReservation.slotId?.slotCode || currentReservation.slotSnapshot?.slotCode}</h2>
                <p className="mt-2 text-sm text-gray-600">{currentReservation.zoneId?.name || currentReservation.zoneSnapshot?.name} • {formatParkingDateTime(currentReservation.reservationStart)} to {formatParkingDateTime(currentReservation.reservationEnd)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ParkingStatusBadge status={currentReservation.status} />
                {currentReservation.status === "reserved" ? <><button type="button" disabled={isActionLoading} onClick={() => handleLifecycle("check-in", currentReservation._id)} className="inline-flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-500 hover:text-white"><FaCheckCircle /> Check In</button><button type="button" disabled={isActionLoading} onClick={() => handleLifecycle("cancel", currentReservation._id)} className="inline-flex items-center gap-2 rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-500 hover:text-white"><FaTimesCircle /> Cancel</button></> : null}
                {currentReservation.status === "occupied" ? <button type="button" disabled={isActionLoading} onClick={() => handleLifecycle("check-out", currentReservation._id)} className="inline-flex items-center gap-2 rounded-xl bg-green-100 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-500 hover:text-white"><FaCheckCircle /> Check Out</button> : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700"><FaClock /></div>
            <p>
              Showing results for <span className="font-semibold text-gray-800">{formatParkingDateTime(overview.selectedRange?.reservationStart)}</span> to <span className="font-semibold text-gray-800">{formatParkingDateTime(overview.selectedRange?.reservationEnd)}</span>
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <CountCard label="Available Slots" value={counts.available || 0} tone="bg-green-100 text-green-700" />
          <CountCard label="Reserved Slots" value={counts.reserved || 0} tone="bg-amber-100 text-amber-700" />
          <CountCard label="Occupied Slots" value={counts.occupied || 0} tone="bg-blue-100 text-blue-700" />
          <CountCard label="Unavailable Slots" value={(counts.unavailable || 0) + (counts.maintenance || 0)} tone="bg-red-100 text-red-700" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {overview.slots.map((slot) => (
            <div key={slot._id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-green-600">{slot.zoneId?.code || "Zone"}</p>
                  <h2 className="mt-1 text-xl font-bold text-gray-800">{slot.slotCode}</h2>
                  <p className="mt-1 text-sm capitalize text-gray-500">{slot.vehicleType} parking</p>
                </div>
                <ParkingStatusBadge status={slot.availabilityStatus || slot.status} />
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>{slot.zoneId?.name || "Campus parking zone"}</p>
                <p>{slot.zoneId?.locationDescription || "Location details unavailable"}</p>
                <p>{slot.remarks || "No remarks"}</p>
                <p className="text-xs text-gray-400">{formatParkingDateTime(overview.selectedRange?.reservationStart)} to {formatParkingDateTime(overview.selectedRange?.reservationEnd)}</p>
                {slot.conflictingReservation ? <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">Conflicts with an existing booking from {formatParkingDateTime(slot.conflictingReservation.reservationStart)} to {formatParkingDateTime(slot.conflictingReservation.reservationEnd)}.</p> : null}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <p className="text-xs text-gray-400">Availability is checked again at confirmation.</p>
                <button type="button" disabled={slot.availabilityStatus !== "available"} onClick={() => { if (!user?._id) { toast.error("Please log in to reserve a slot"); return; } setSelectedSlot(slot); }} className="rounded-xl bg-green-400 px-4 py-3 text-sm font-semibold text-black shadow-md hover:bg-green-500 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500">Reserve</button>
              </div>
            </div>
          ))}
        </div>

        {!overview.slots.length && !isLoading ? <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">No parking slots match the selected booking window and filters.</div> : null}
        {isLoading ? <div className="rounded-2xl bg-white p-6 text-sm text-gray-500 shadow-sm">Loading parking availability...</div> : null}
      </div>

      <ParkingReservationModal isOpen={Boolean(selectedSlot)} slot={selectedSlot} bookingWindow={overview.selectedRange} onClose={() => setSelectedSlot(null)} onSubmit={handleReserve} isSubmitting={isActionLoading} />
    </div>
  );
};

export default ParkingUser;
