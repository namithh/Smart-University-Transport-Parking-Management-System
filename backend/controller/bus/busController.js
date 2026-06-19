const Bus = require("../../models/bus/Buses");

//  Add Bus
exports.addBus = async (req, res) => {
  try {
    const { bus_number, bus_type, driver, total_seats, available_seats, route, departure_time, arrival_time } = req.body;
    const newBus = new Bus({ bus_number, bus_type, driver, total_seats, available_seats, route, departure_time, arrival_time });
    await newBus.save();
    res.status(201).json({ message: "Bus added successfully", newBus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Get All Buses
exports.getBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    res.status(200).json(buses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Get Single Bus by ID
exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });
    res.status(200).json(bus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Update Bus
exports.updateBus = async (req, res) => {
  try {
    const updatedBus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBus) return res.status(404).json({ message: "Bus not found" });
    res.status(200).json({ message: "Bus updated", updatedBus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Delete Bus
exports.deleteBus = async (req, res) => {
  try {
    const deletedBus = await Bus.findByIdAndDelete(req.params.id);
    if (!deletedBus) return res.status(404).json({ message: "Bus not found" });
    res.status(200).json({ message: "Bus deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
