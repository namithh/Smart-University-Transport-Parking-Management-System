// controller/statsController.js
const User = require("../models/userModel");
const Bus = require("../models/bus/Buses");
const Route = require("../models/Route_Management/Route");
const Booking = require("../models/Booking/Booking");
const Payment = require("../models/Financial/financialModel");
const Driver = require("../models/Driver/drivermodel");

// GET /api/stats
const getStats = async (req, res) => {
  try {
    const [users, buses, routes, bookings, drivers, revenue] = await Promise.all([
      User.countDocuments(),
      Bus.countDocuments(),
      Route.countDocuments(),
      Booking.countDocuments(),
      Driver.countDocuments(),
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    res.json({
      users,
      buses,
      routes,
      bookings,
      drivers,
      revenue: revenue[0]?.total || 0
    });
  } catch (err) {
    console.error("Error in getStats:", err);
    res.status(500).json({ error: "Failed to fetch stats", details: err.message });
  }
};

module.exports = { getStats };
