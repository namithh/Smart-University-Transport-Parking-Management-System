const express = require("express");
const router = express.Router();
const routeController = require("../controller/Route_Management/routeController");

router.post("/", routeController.addRoute);
router.get("/", routeController.getRoutes);
router.get("/:id", routeController.getRouteById);
router.put("/:id", routeController.updateRoute);
router.delete("/:id", routeController.deleteRoute);


module.exports = router;
