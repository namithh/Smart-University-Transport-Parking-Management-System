const express = require("express");
const router = express.Router();
const busController = require("../controller/bus/busController");

router.post("/", busController.addBus);
router.get("/", busController.getBuses);
router.get("/:id", busController.getBusById);
router.put("/:id", busController.updateBus);
router.delete("/:id", busController.deleteBus);

module.exports = router;
