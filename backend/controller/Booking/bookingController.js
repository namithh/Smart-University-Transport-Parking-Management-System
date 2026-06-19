const Booking = require('../../models/Booking/Booking');
const Bus = require('../../models/bus/Buses');


// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("busId", "bus_number bus_type");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const { busId, passengerName, phone, seats, date } = req.body;

    // Check if bus exists
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    // Check seat availability
    if (bus.available_seats < seats) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    // Create booking
    const booking = new Booking({
      busId,
      passengerName,
      phone,
      seats,
      date,
    });
    await booking.save();

    // Update available seats
    bus.available_seats -= seats;
    await bus.save();

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("busId", "bus_number bus_type");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("busId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Restore seats to bus
    const bus = await Bus.findById(booking.busId);
    if (bus) {
      bus.available_seats += booking.seats;
      await bus.save();
    }

    await booking.deleteOne();
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};