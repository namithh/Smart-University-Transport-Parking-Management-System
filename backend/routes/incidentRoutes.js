const express = require("express");
const router = express.Router();
const authToken = require("../middleware/authToken");
const isAdmin = require("../middleware/isAdmin");
const incidentController = require("../controller/incidentController");

router.post("/create", authToken, incidentController.createIncident);
router.get("/all", authToken, isAdmin, incidentController.getAllIncidents);
router.get("/user", authToken, incidentController.getUserIncidents);
router.put("/assign/:id", authToken, isAdmin, incidentController.assignIncident);
router.put("/status/:id", authToken, isAdmin, incidentController.updateIncidentStatus);
router.delete("/delete/:id", authToken, isAdmin, incidentController.deleteIncident);

module.exports = router;
