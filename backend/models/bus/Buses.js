const mongoose = require("mongoose");

const BusSchema = new mongoose.Schema({
  bus_number: { type: String, required: true, unique: true },
  bus_type: { type: String, required: true },
  driver: { type: String ,required: true },
  total_seats: { type: Number, required: true },
  available_seats: { type: Number, required: false },
  route: { type: String, required: true },
  departure_time: { type: String, required: true },
  arrival_time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bus", BusSchema);
