const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },
    passengerName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, // 10-digit phone number
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: String, // YYYY-MM-DD format
      required: true,
    },
     status: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusBooking", bookingSchema);



