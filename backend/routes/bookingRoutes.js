const express = require("express");
const router = express.Router();
const bookingController = require("../controller/booking/bookingController");

// POST - create booking
router.post("/", bookingController.createBooking);

// GET - all bookings
router.get("/", bookingController.getBookings);

// GET - single booking
router.get("/:id", bookingController.getBookingById);

// DELETE - cancel booking
router.delete("/:id", bookingController.deleteBooking);

// PUT - update booking status
router.put("/:id/status", bookingController.updateBookingStatus);


module.exports = router;
