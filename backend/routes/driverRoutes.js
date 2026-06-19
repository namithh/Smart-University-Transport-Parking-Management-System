const express = require("express");
const router = express.Router();
const {
  addDriver,
  getDrivers,
  updateDriver,
  deleteDriver
} = require("../controller/Driver/drivercontroller");

router.post("/", addDriver);         // Add driver
router.get("/", getDrivers);         // Get all drivers
router.put("/:id", updateDriver);    // Update driver
router.delete("/:id", deleteDriver); // Delete driver

module.exports = router;

