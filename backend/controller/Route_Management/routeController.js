const Route = require("../../models/Route_Management/Route");

// Add Route
exports.addRoute = async (req, res) => {
  try {
    const { route_name, start_location, end_location, distance, duration, price, status } = req.body;
    const newRoute = new Route({ route_name, start_location, end_location, distance, duration, price,status });
    await newRoute.save();
    res.status(201).json({ message: "Route added successfully", newRoute });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Routes
exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Single Route by ID
exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });
    res.status(200).json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Route
exports.updateRoute = async (req, res) => {
  try {
    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRoute) return res.status(404).json({ message: "Route not found" });
    res.status(200).json({ message: "Route updated", updatedRoute });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Route
exports.deleteRoute = async (req, res) => {
  try {
    const deletedRoute = await Route.findByIdAndDelete(req.params.id);
    if (!deletedRoute) return res.status(404).json({ message: "Route not found" });
    res.status(200).json({ message: "Route deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
