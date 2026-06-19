
const mongoose = require("mongoose");

const RouteSchema = new mongoose.Schema({
  route_name: {
    type: String,
    required: true,
    trim: true,
  },
  start_location: {
    type: String,
    required: true,
    trim: true,
  },
  end_location: {
    type: String,
    required: true,
    trim: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  duration: {
    type: String, // Could be "2h 30m" or similar
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String, // Example: "Active", "Inactive"
    default: "Active",
    enum: ["Active", "Inactive"],
  },

});

module.exports = mongoose.model("Route", RouteSchema);
