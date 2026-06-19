const mongoose = require("mongoose");
const {
  RESERVATION_STATUSES,
  VEHICLE_TYPES,
} = require("../../helpers/parking/constants");

const parkingReservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: true,
      index: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingSlot",
      required: true,
      index: true,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingZone",
      required: true,
      index: true,
    },
    vehicleType: {
      type: String,
      enum: VEHICLE_TYPES,
      required: true,
    },
    reservationStart: {
      type: Date,
      required: true,
    },
    reservationEnd: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: RESERVATION_STATUSES,
      default: "reserved",
      index: true,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    checkedInAt: Date,
    checkedOutAt: Date,
    cancelledAt: Date,
    expiredAt: Date,
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    zoneSnapshot: {
      name: String,
      code: String,
      locationDescription: String,
    },
    slotSnapshot: {
      slotCode: String,
    },
  },
  { timestamps: true }
);

parkingReservationSchema.index({ slotId: 1, status: 1, reservationStart: 1 });
parkingReservationSchema.index({ slotId: 1, reservationStart: 1, reservationEnd: 1, status: 1 });
parkingReservationSchema.index({ userId: 1, status: 1, reservationStart: -1 });

module.exports = mongoose.model("ParkingReservation", parkingReservationSchema);
