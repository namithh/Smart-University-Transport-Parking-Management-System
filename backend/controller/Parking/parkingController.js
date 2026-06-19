const parkingService = require("../../services/parking/parkingService");

const sendSuccess = (res, message, data, statusCode = 200) =>
  res.status(statusCode).json({
    success: true,
    error: false,
    message,
    data,
  });

const sendFailure = (res, error) =>
  res.status(error.statusCode || 500).json({
    success: false,
    error: true,
    message: error.message || "Something went wrong",
  });

const withHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    sendFailure(res, error);
  }
};

const getAdminDashboard = withHandler(async (req, res) => {
  const dashboard = await parkingService.getAdminDashboard(req.query);
  sendSuccess(res, "Parking dashboard loaded", dashboard);
});

const listZones = withHandler(async (req, res) => {
  const zones = await parkingService.listZones(req.query.activeOnly === "true" ? { status: "active" } : {});
  sendSuccess(res, "Parking zones loaded", zones);
});

const createZone = withHandler(async (req, res) => {
  const zone = await parkingService.createZone(req.body, req.userId);
  sendSuccess(res, "Parking zone created", zone, 201);
});

const updateZone = withHandler(async (req, res) => {
  const zone = await parkingService.updateZone(req.params.zoneId, req.body, req.userId);
  sendSuccess(res, "Parking zone updated", zone);
});

const deleteZone = withHandler(async (req, res) => {
  await parkingService.deleteZone(req.params.zoneId, req.userId);
  sendSuccess(res, "Parking zone deleted", null);
});

const listSlots = withHandler(async (req, res) => {
  const slots = await parkingService.listSlots(req.query);
  sendSuccess(res, "Parking slots loaded", slots);
});

const createSlot = withHandler(async (req, res) => {
  const slot = await parkingService.createSlot(req.body, req.userId);
  sendSuccess(res, "Parking slot created", slot, 201);
});

const bulkCreateSlots = withHandler(async (req, res) => {
  const slots = await parkingService.bulkCreateSlots(req.body, req.userId);
  sendSuccess(res, "Parking slots created", slots, 201);
});

const updateSlot = withHandler(async (req, res) => {
  const slot = await parkingService.updateSlot(req.params.slotId, req.body, req.userId);
  sendSuccess(res, "Parking slot updated", slot);
});

const deleteSlot = withHandler(async (req, res) => {
  await parkingService.deleteSlot(req.params.slotId, req.userId);
  sendSuccess(res, "Parking slot deleted", null);
});

const updateSlotStatus = withHandler(async (req, res) => {
  const slot = await parkingService.updateSlotStatus(req.params.slotId, req.body.status, req.userId);
  sendSuccess(res, "Parking slot status updated", slot);
});

const listReservations = withHandler(async (req, res) => {
  const reservations = await parkingService.listReservations(req.query);
  sendSuccess(res, "Parking reservations loaded", reservations);
});

const getUsageAnalytics = withHandler(async (req, res) => {
  const usage = await parkingService.getUsageAnalytics(req.query);
  sendSuccess(res, "Parking usage loaded", usage);
});

const getPublicOverview = withHandler(async (req, res) => {
  const overview = await parkingService.getPublicOverview(req.query);
  sendSuccess(res, "Parking overview loaded", overview);
});

const createReservation = withHandler(async (req, res) => {
  const reservation = await parkingService.createReservation(req.body, req.userId);
  sendSuccess(res, "Parking reservation created", reservation, 201);
});

const listMyReservations = withHandler(async (req, res) => {
  const reservations = await parkingService.listMyReservations(req.userId, req.query);
  sendSuccess(res, "My parking reservations loaded", reservations);
});

const cancelReservation = withHandler(async (req, res) => {
  const reservation = await parkingService.updateReservationLifecycle(
    req.params.reservationId,
    "cancelled",
    req.userId,
    req.userRole === "ADMIN" ? "admin" : "user"
  );
  sendSuccess(res, "Reservation cancelled", reservation);
});

const checkInReservation = withHandler(async (req, res) => {
  const reservation = await parkingService.updateReservationLifecycle(
    req.params.reservationId,
    "occupied",
    req.userId,
    req.userRole === "ADMIN" ? "admin" : "user"
  );
  sendSuccess(res, "Reservation checked in", reservation);
});

const checkOutReservation = withHandler(async (req, res) => {
  const reservation = await parkingService.updateReservationLifecycle(
    req.params.reservationId,
    "completed",
    req.userId,
    req.userRole === "ADMIN" ? "admin" : "user"
  );
  sendSuccess(res, "Reservation checked out", reservation);
});

const seedSampleData = withHandler(async (req, res) => {
  const seedResult = await parkingService.seedParkingSampleData();
  sendSuccess(res, "Parking sample data prepared", seedResult);
});

module.exports = {
  bulkCreateSlots,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  createReservation,
  createSlot,
  createZone,
  deleteSlot,
  deleteZone,
  getAdminDashboard,
  getPublicOverview,
  getUsageAnalytics,
  listMyReservations,
  listReservations,
  listSlots,
  listZones,
  seedSampleData,
  updateSlot,
  updateSlotStatus,
  updateZone,
};
