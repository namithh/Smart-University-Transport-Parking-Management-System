const express = require("express");
const router = express.Router();
const statsController = require ("../controller/statsController");




// GET /api/stats
router.get("/", statsController.getStats);

module.exports = router;
