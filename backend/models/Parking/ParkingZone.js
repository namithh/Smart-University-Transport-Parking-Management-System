const mongoose = require("mongoose");
const { VEHICLE_TYPES, ZONE_STATUSES } = require("../../helpers/parking/constants");

const parkingZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    locationDescription: {
      type: String,
      trim: true,
      default: "",
    },
    supportedVehicleTypes: {
      type: [String],
      enum: VEHICLE_TYPES,
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one supported vehicle type is required",
      },
    },
    totalSlots: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ZONE_STATUSES,
      default: "active",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

parkingZoneSchema.index({ status: 1, code: 1 });

module.exports = mongoose.model("ParkingZone", parkingZoneSchema);
