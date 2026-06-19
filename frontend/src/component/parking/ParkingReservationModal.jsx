import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { PARKING_TIMEZONE_LABEL, formatParkingDateTime } from "../../lib/parking";

const ParkingReservationModal = ({
  isOpen,
  slot,
  bookingWindow,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setRemarks("");
  }, [isOpen]);

  if (!isOpen || !slot || !bookingWindow?.reservationStart || !bookingWindow?.reservationEnd) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      slotId: slot._id,
      zoneId: slot.zoneId?._id,
      vehicleType: slot.vehicleType,
      reservationStart: bookingWindow.reservationStart,
      reservationEnd: bookingWindow.reservationEnd,
      remarks,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-green-400 px-6 py-4 text-white">
          <div>
            <h2 className="text-xl font-bold">Confirm Parking Reservation</h2>
            <p className="text-sm text-green-50">{PARKING_TIMEZONE_LABEL}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white/15 p-2 hover:bg-white/25">
            <FaTimes />
          </button>
        </div>

        <form className="space-y-5 p-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase text-amber-600">Selected Slot</p>
              <p className="mt-1 text-lg font-semibold text-gray-800">{slot.slotCode}</p>
              <p className="text-sm text-gray-600">{slot.zoneId?.name || "Campus zone"}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase text-blue-600">Booking Window</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {formatParkingDateTime(bookingWindow.reservationStart)}
              </p>
              <p className="text-sm text-gray-600">
                to {formatParkingDateTime(bookingWindow.reservationEnd)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <p>Vehicle type: <span className="font-semibold capitalize text-gray-800">{slot.vehicleType}</span></p>
            <p className="mt-1">{slot.zoneId?.locationDescription || "Campus parking area"}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              rows={3}
              placeholder="Optional note for security or access staff"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 md:flex-row md:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-green-400 px-5 py-3 text-sm font-semibold text-black shadow-md transition hover:bg-green-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Confirm Reservation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParkingReservationModal;
