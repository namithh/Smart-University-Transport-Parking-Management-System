import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaArrowLeft, FaCheckCircle, FaHistory, FaSyncAlt, FaTimesCircle } from "react-icons/fa";
import ParkingStatusBadge from "../../component/parking/ParkingStatusBadge";
import {
  PARKING_POLLING_INTERVAL_MS,
  PARKING_TIMEZONE_LABEL,
  formatDurationMinutes,
  formatParkingDateTime,
} from "../../lib/parking";
import {
  cancelParkingReservation,
  checkInParkingReservation,
  checkOutParkingReservation,
  fetchMyParkingReservations,
} from "../../services/parkingService";

const MyParkingReservations = () => {
  const user = useSelector((state) => state?.user?.user);
  const [reservations, setReservations] = useState([]);
  const [filters, setFilters] = useState({ status: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user?._id) {
      setReservations([]);
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    const loadReservations = async () => {
      try {
        if (isMounted) setIsLoading(true);
        const data = await fetchMyParkingReservations(filters);
        if (isMounted) setReservations(data);
      } catch (error) {
        if (isMounted) toast.error(error.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadReservations();
    const intervalId = setInterval(loadReservations, PARKING_POLLING_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [filters, refreshKey, user?._id]);

  const handleAction = async (type, reservationId) => {
    try {
      setIsActionLoading(true);

      if (type === "cancel") {
        await cancelParkingReservation(reservationId);
        toast.success("Reservation cancelled");
      } else if (type === "check-in") {
        await checkInParkingReservation(reservationId);
        toast.success("Checked in successfully");
      } else if (type === "check-out") {
        await checkOutParkingReservation(reservationId);
        toast.success("Checked out successfully");
      }

      setRefreshKey((value) => value + 1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!user?._id) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">My Parking Reservations</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to view and manage your parking reservations.</p>
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-xl bg-green-400 px-5 py-3 text-sm font-semibold text-black shadow-md transition hover:bg-green-500 hover:text-white"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-24">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Parking History</p>
              <h1 className="mt-1 text-3xl font-bold text-gray-800">My Parking Reservations</h1>
              <p className="mt-2 text-sm text-gray-600">{PARKING_TIMEZONE_LABEL}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/parking-user"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <FaArrowLeft /> Back to Parking
              </Link>
              <button
                type="button"
                onClick={() => setRefreshKey((value) => value + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-500 hover:text-white"
              >
                <FaSyncAlt /> Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                <FaHistory />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Reservation Records</h2>
                <p className="text-sm text-gray-500">Track active, completed, cancelled, and expired bookings.</p>
              </div>
            </div>

            <select
              value={filters.status}
              onChange={(event) => setFilters({ status: event.target.value })}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
            >
              <option value="">All statuses</option>
              <option value="reserved">Reserved</option>
              <option value="occupied">Occupied</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Slot</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Zone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Reservation Window</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Check In/Out</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                      No parking reservations found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr key={reservation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{reservation.slotId?.slotCode || reservation.slotSnapshot?.slotCode || "-"}</p>
                        <p className="text-sm capitalize text-gray-500">{reservation.vehicleType}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-700">{reservation.zoneId?.name || reservation.zoneSnapshot?.name || "-"}</p>
                        <p className="text-sm text-gray-500">{reservation.zoneId?.code || reservation.zoneSnapshot?.code || "-"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <p>{formatParkingDateTime(reservation.reservationStart)}</p>
                        <p>{formatParkingDateTime(reservation.reservationEnd)}</p>
                        <p className="mt-1 text-xs text-gray-400">{formatDurationMinutes(reservation.durationMinutes)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <ParkingStatusBadge status={reservation.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <p>In: {formatParkingDateTime(reservation.checkedInAt)}</p>
                        <p>Out: {formatParkingDateTime(reservation.checkedOutAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {reservation.status === "reserved" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAction("check-in", reservation._id)}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-500 hover:text-white"
                              >
                                <FaCheckCircle /> Check In
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAction("cancel", reservation._id)}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-500 hover:text-white"
                              >
                                <FaTimesCircle /> Cancel
                              </button>
                            </>
                          )}
                          {reservation.status === "occupied" && (
                            <button
                              type="button"
                              onClick={() => handleAction("check-out", reservation._id)}
                              disabled={isActionLoading}
                              className="inline-flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-500 hover:text-white"
                            >
                              <FaCheckCircle /> Check Out
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-2xl bg-white p-6 text-sm text-gray-500 shadow-sm">
            Loading parking reservations...
          </div>
        )}
      </div>
    </div>
  );
};

export default MyParkingReservations;
