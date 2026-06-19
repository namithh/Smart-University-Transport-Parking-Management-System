const express = require("express");
const router = express.Router();
const authToken = require("../middleware/authToken");
const isAdmin = require("../middleware/isAdmin");
const notificationController = require("../controller/notificationController");

router.post("/create", authToken, isAdmin, notificationController.createNotification);
router.get("/all", authToken, isAdmin, notificationController.getAllNotifications);
router.get("/user", authToken, notificationController.getUserNotifications);
router.put("/read/:id", authToken, notificationController.markAsRead);
router.delete("/delete/:id", authToken, isAdmin, notificationController.deleteNotification);

module.exports = router;
