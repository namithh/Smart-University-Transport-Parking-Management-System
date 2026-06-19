const express = require("express");
const authToken = require("../middleware/authToken");
const isAdmin = require("../middleware/isAdmin");
const parkingController = require("../controller/Parking/parkingController");

const router = express.Router();

router.get("/overview", parkingController.getPublicOverview);
router.get("/zones", parkingController.listZones);

router.use(authToken);

router.post("/reservations", parkingController.createReservation);
router.get("/my-reservations", parkingController.listMyReservations);
router.post("/reservations/:reservationId/cancel", parkingController.cancelReservation);
router.post("/reservations/:reservationId/check-in", parkingController.checkInReservation);
router.post("/reservations/:reservationId/check-out", parkingController.checkOutReservation);

router.use(isAdmin);

router.get("/admin/dashboard", parkingController.getAdminDashboard);
router.get("/admin/zones", parkingController.listZones);
router.post("/admin/zones", parkingController.createZone);
router.put("/admin/zones/:zoneId", parkingController.updateZone);
router.delete("/admin/zones/:zoneId", parkingController.deleteZone);

router.get("/admin/slots", parkingController.listSlots);
router.post("/admin/slots", parkingController.createSlot);
router.post("/admin/slots/bulk", parkingController.bulkCreateSlots);
router.put("/admin/slots/:slotId", parkingController.updateSlot);
router.patch("/admin/slots/:slotId/status", parkingController.updateSlotStatus);
router.delete("/admin/slots/:slotId", parkingController.deleteSlot);

router.get("/admin/reservations", parkingController.listReservations);
router.get("/admin/usage", parkingController.getUsageAnalytics);
router.post("/admin/reservations/:reservationId/cancel", parkingController.cancelReservation);
router.post("/admin/reservations/:reservationId/check-in", parkingController.checkInReservation);
router.post("/admin/reservations/:reservationId/check-out", parkingController.checkOutReservation);
router.post("/admin/seed", parkingController.seedSampleData);

module.exports = router;
