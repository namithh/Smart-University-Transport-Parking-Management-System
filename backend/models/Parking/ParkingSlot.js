const mongoose = require("mongoose");
const { SLOT_STATUSES, VEHICLE_TYPES } = require("../../helpers/parking/constants");

const parkingSlotSchema = new mongoose.Schema(
  {
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingZone",
      required: true,
      index: true,
    },
    slotCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    vehicleType: {
      type: String,
      enum: VEHICLE_TYPES,
      required: true,
    },
    status: {
      type: String,
      enum: SLOT_STATUSES,
      default: "available",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    activeReservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingReservation",
      default: null,
    },
    reservedUntil: {
      type: Date,
      default: null,
    },
    bookingLockToken: {
      type: String,
      default: null,
      index: true,
    },
    bookingLockExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastStatusChangedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

parkingSlotSchema.index({ zoneId: 1, slotCode: 1 }, { unique: true });
parkingSlotSchema.index({ vehicleType: 1, status: 1 });

module.exports = mongoose.model("ParkingSlot", parkingSlotSchema);
