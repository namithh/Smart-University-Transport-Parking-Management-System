const mongoose = require("mongoose");
const { USAGE_ACTIONS } = require("../../helpers/parking/constants");

const parkingUsageLogSchema = new mongoose.Schema(
  {
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingReservation",
      default: null,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      default: null,
      index: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingSlot",
      default: null,
      index: true,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingZone",
      default: null,
      index: true,
    },
    action: {
      type: String,
      enum: USAGE_ACTIONS,
      required: true,
      index: true,
    },
    actionTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ParkingUsageLog", parkingUsageLogSchema);
