const mongoose = require("mongoose");
const ParkingZone = require("../../models/Parking/ParkingZone");
const ParkingSlot = require("../../models/Parking/ParkingSlot");
const ParkingReservation = require("../../models/Parking/ParkingReservation");
const ParkingUsageLog = require("../../models/Parking/ParkingUsageLog");
const Notification = require("../../models/Notification");
const User = require("../../models/userModel");
const {
  ACTIVE_RESERVATION_STATUSES,
  MANUAL_SLOT_STATUSES,
  SLOT_STATUSES,
  VEHICLE_TYPES,
  ZONE_STATUSES,
} = require("../../helpers/parking/constants");

const BOOKING_LOCK_TTL_MS = 15000;

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
};

const parseDateValue = (value, fieldName) => {
  const parsed = new Date(value);
  if (!value || Number.isNaN(parsed.getTime())) {
    const error = new Error(`${fieldName} is invalid`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
};

const normalizeVehicleTypes = (value) => {
  const list = Array.isArray(value) ? value : [value];
  const normalized = [...new Set(list.filter(Boolean).map((item) => String(item).toLowerCase()))];
  if (!normalized.length || normalized.some((type) => !VEHICLE_TYPES.includes(type))) {
    const error = new Error("Supported vehicle types must contain car and/or bike");
    error.statusCode = 400;
    throw error;
  }
  return normalized;
};

const ensurePositiveNumber = (value, fieldName) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} must be a positive number`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
};

const createAppError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const logUsage = async ({
  reservationId = null,
  userId = null,
  slotId = null,
  zoneId = null,
  action,
  metadata = {},
}) => {
  await ParkingUsageLog.create({
    reservationId,
    userId,
    slotId,
    zoneId,
    action,
    metadata,
  });
};

const syncZoneSlotCount = async (zoneId) => {
  const totalSlots = await ParkingSlot.countDocuments({ zoneId });
  await ParkingZone.findByIdAndUpdate(zoneId, { totalSlots });
};

const buildSlotQuery = (filters = {}) => {
  const query = {};
  if (filters.zoneId) query.zoneId = filters.zoneId;
  if (filters.vehicleType) query.vehicleType = filters.vehicleType;
  if (filters.status) query.status = filters.status;
  if (filters.isActive !== undefined) query.isActive = parseBoolean(filters.isActive, true);
  if (filters.search) query.slotCode = { $regex: filters.search.trim(), $options: "i" };
  return query;
};

const buildReservationQuery = (filters = {}) => {
  const query = {};
  if (filters.zoneId) query.zoneId = filters.zoneId;
  if (filters.slotId) query.slotId = filters.slotId;
  if (filters.vehicleType) query.vehicleType = filters.vehicleType;
  if (filters.status) query.status = filters.status;
  if (filters.userId) query.userId = filters.userId;
  if (filters.reservationStart && filters.reservationEnd) {
    const reservationStart = new Date(filters.reservationStart);
    const reservationEnd = new Date(filters.reservationEnd);
    if (!Number.isNaN(reservationStart.getTime()) && !Number.isNaN(reservationEnd.getTime())) {
      query.reservationStart = { $lt: reservationEnd };
      query.reservationEnd = { $gt: reservationStart };
    }
  }
  if (filters.date) {
    const dayStart = new Date(filters.date);
    if (!Number.isNaN(dayStart.getTime())) {
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCHours(23, 59, 59, 999);
      dayStart.setUTCHours(0, 0, 0, 0);
      query.reservationStart = { $lte: dayEnd };
      query.reservationEnd = { $gte: dayStart };
    }
  }
  return query;
};

const buildOverlapReservationQuery = ({
  slotId,
  reservationStart,
  reservationEnd,
  slotIds,
  excludeReservationId,
}) => {
  const query = {
    status: { $in: ACTIVE_RESERVATION_STATUSES },
    reservationStart: { $lt: reservationEnd },
    reservationEnd: { $gt: reservationStart },
  };

  if (slotId) query.slotId = slotId;
  if (slotIds?.length) query.slotId = { $in: slotIds };
  if (excludeReservationId) query._id = { $ne: excludeReservationId };

  return query;
};

const acquireSlotBookingLock = async (slotId) => {
  const token = new mongoose.Types.ObjectId().toString();
  const now = new Date();
  const lockExpiry = new Date(now.getTime() + BOOKING_LOCK_TTL_MS);

  const slot = await ParkingSlot.findOneAndUpdate(
    {
      _id: slotId,
      isActive: true,
      $or: [
        { bookingLockToken: null },
        { bookingLockExpiresAt: null },
        { bookingLockExpiresAt: { $lte: now } },
      ],
    },
    {
      $set: {
        bookingLockToken: token,
        bookingLockExpiresAt: lockExpiry,
      },
    },
    { new: true }
  ).populate("zoneId", "name code status supportedVehicleTypes locationDescription");

  if (!slot) {
    throw createAppError("This slot is currently being booked by another user. Please try again.", 409);
  }

  return { slot, token };
};

const releaseSlotBookingLock = async (slotId, token) => {
  if (!slotId || !token) return;

  await ParkingSlot.updateOne(
    { _id: slotId, bookingLockToken: token },
    {
      $set: {
        bookingLockToken: null,
        bookingLockExpiresAt: null,
      },
    }
  );
};

const syncSlotLiveStatus = async (slotId, referenceTime = new Date()) => {
  const slot = await ParkingSlot.findById(slotId).lean();
  if (!slot) return null;

  if (!slot.isActive || ["unavailable", "maintenance"].includes(slot.status)) {
    return slot;
  }

  const occupiedReservation = await ParkingReservation.findOne({
    ...buildOverlapReservationQuery({
      slotId,
      reservationStart: referenceTime,
      reservationEnd: new Date(referenceTime.getTime() + 1),
    }),
    status: "occupied",
  })
    .sort({ reservationStart: 1 })
    .lean();

  const reservedReservation = occupiedReservation
    ? null
    : await ParkingReservation.findOne({
        ...buildOverlapReservationQuery({
          slotId,
          reservationStart: referenceTime,
          reservationEnd: new Date(referenceTime.getTime() + 1),
        }),
        status: "reserved",
      })
        .sort({ reservationStart: 1 })
        .lean();

  const nextStatus = occupiedReservation ? "occupied" : reservedReservation ? "reserved" : "available";
  const nextReservationId = occupiedReservation?._id || reservedReservation?._id || null;
  const nextReservedUntil = occupiedReservation?.reservationEnd || reservedReservation?.reservationEnd || null;

  if (
    slot.status !== nextStatus ||
    String(slot.activeReservationId || "") !== String(nextReservationId || "") ||
    String(slot.reservedUntil || "") !== String(nextReservedUntil || "")
  ) {
    await ParkingSlot.updateOne(
      { _id: slotId },
      {
        $set: {
          status: nextStatus,
          activeReservationId: nextReservationId,
          reservedUntil: nextReservedUntil,
          lastStatusChangedAt: referenceTime,
        },
      }
    );
  }

  return {
    ...slot,
    status: nextStatus,
    activeReservationId: nextReservationId,
    reservedUntil: nextReservedUntil,
  };
};

const syncAllSlotLiveStatuses = async (referenceTime = new Date()) => {
  const slots = await ParkingSlot.find({
    isActive: true,
    status: { $nin: ["unavailable", "maintenance"] },
  })
    .select("_id")
    .lean();

  await Promise.all(slots.map((slot) => syncSlotLiveStatus(slot._id, referenceTime)));
};

const attachReservationMeta = (reservation) => {
  const start = reservation.reservationStart ? new Date(reservation.reservationStart) : null;
  const end = reservation.reservationEnd ? new Date(reservation.reservationEnd) : null;
  return {
    ...reservation,
    durationMinutes:
      start && end ? Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000)) : 0,
  };
};

const releaseExpiredReservations = async () => {
  const now = new Date();
  const expiredReservations = await ParkingReservation.find({
    status: "reserved",
    reservationEnd: { $lte: now },
  }).lean();

  if (!expiredReservations.length) return { expiredCount: 0 };

  for (const reservation of expiredReservations) {
    await ParkingReservation.updateOne(
      { _id: reservation._id, status: "reserved" },
      { $set: { status: "expired", expiredAt: now } }
    );

    await logUsage({
      reservationId: reservation._id,
      userId: reservation.userId,
      slotId: reservation.slotId,
      zoneId: reservation.zoneId,
      action: "reservation_expired",
      metadata: {
        expiredAt: now,
        slotCode: reservation.slotSnapshot?.slotCode,
      },
    });
  }

  await Promise.all(
    [...new Set(expiredReservations.map((reservation) => String(reservation.slotId)))].map((slotId) =>
      syncSlotLiveStatus(slotId, now)
    )
  );

  return { expiredCount: expiredReservations.length };
};

const listZones = async (filters = {}) => ParkingZone.find(filters).sort({ createdAt: -1 }).lean();

const createZone = async (payload, userId) => {
  const name = String(payload.name || "").trim();
  const code = String(payload.code || "").trim().toUpperCase();
  if (!name || !code) throw createAppError("Zone name and code are required");

  const status = payload.status ? String(payload.status).toLowerCase() : "active";
  if (!ZONE_STATUSES.includes(status)) throw createAppError("Zone status is invalid");

  const zone = await ParkingZone.create({
    name,
    code,
    description: String(payload.description || "").trim(),
    locationDescription: String(payload.locationDescription || "").trim(),
    supportedVehicleTypes: normalizeVehicleTypes(payload.supportedVehicleTypes),
    status,
    notes: String(payload.notes || "").trim(),
  });

  await logUsage({
    userId,
    zoneId: zone._id,
    action: "zone_created",
    metadata: { name: zone.name, code: zone.code },
  });

  return zone;
};

const updateZone = async (zoneId, payload, userId) => {
  const zone = await ParkingZone.findById(zoneId);
  if (!zone) throw createAppError("Parking zone not found", 404);

  if (payload.name !== undefined) zone.name = String(payload.name || "").trim();
  if (payload.code !== undefined) zone.code = String(payload.code || "").trim().toUpperCase();
  if (payload.description !== undefined) zone.description = String(payload.description || "").trim();
  if (payload.locationDescription !== undefined) {
    zone.locationDescription = String(payload.locationDescription || "").trim();
  }
  if (payload.notes !== undefined) zone.notes = String(payload.notes || "").trim();
  if (payload.supportedVehicleTypes !== undefined) {
    zone.supportedVehicleTypes = normalizeVehicleTypes(payload.supportedVehicleTypes);
  }
  if (payload.status !== undefined) {
    const status = String(payload.status).toLowerCase();
    if (!ZONE_STATUSES.includes(status)) throw createAppError("Zone status is invalid");
    zone.status = status;
  }

  await zone.save();

  await logUsage({
    userId,
    zoneId: zone._id,
    action: "zone_updated",
    metadata: { name: zone.name, code: zone.code, status: zone.status },
  });

  return zone;
};

const deleteZone = async (zoneId, userId) => {
  const activeSlots = await ParkingSlot.countDocuments({ zoneId });
  if (activeSlots > 0) {
    throw createAppError("Delete parking slots in this zone before deleting the zone");
  }

  const deleted = await ParkingZone.findByIdAndDelete(zoneId);
  if (!deleted) throw createAppError("Parking zone not found", 404);

  await logUsage({
    userId,
    zoneId,
    action: "zone_deleted",
    metadata: { name: deleted.name, code: deleted.code },
  });
};

const ensureZoneCompatibility = async (zoneId, vehicleType) => {
  const zone = await ParkingZone.findById(zoneId);
  if (!zone) throw createAppError("Parking zone not found", 404);
  if (zone.status !== "active") throw createAppError("Selected parking zone is inactive");
  if (!zone.supportedVehicleTypes.includes(vehicleType)) {
    throw createAppError("Selected zone does not support this vehicle type");
  }
  return zone;
};

const listSlots = async (filters = {}) => {
  const query = buildSlotQuery(filters);
  return ParkingSlot.find(query)
    .populate("zoneId", "name code status supportedVehicleTypes locationDescription")
    .sort({ createdAt: -1 })
    .lean();
};

const createSlot = async (payload, userId) => {
  const zoneId = payload.zoneId;
  const slotCode = String(payload.slotCode || "").trim().toUpperCase();
  const vehicleType = String(payload.vehicleType || "").toLowerCase();

  if (!zoneId || !slotCode || !vehicleType) {
    throw createAppError("Zone, slot code, and vehicle type are required");
  }
  if (!VEHICLE_TYPES.includes(vehicleType)) throw createAppError("Vehicle type is invalid");

  const zone = await ensureZoneCompatibility(zoneId, vehicleType);

  const slot = await ParkingSlot.create({
    zoneId,
    slotCode,
    vehicleType,
    status: payload.status && SLOT_STATUSES.includes(payload.status) ? payload.status : "available",
    isActive: payload.isActive !== undefined ? parseBoolean(payload.isActive, true) : true,
    remarks: String(payload.remarks || "").trim(),
  });

  await syncZoneSlotCount(zoneId);
  await logUsage({
    userId,
    slotId: slot._id,
    zoneId,
    action: "slot_created",
    metadata: { slotCode: slot.slotCode, zoneCode: zone.code, vehicleType },
  });

  return slot.populate("zoneId", "name code status supportedVehicleTypes locationDescription");
};

const bulkCreateSlots = async (payload, userId) => {
  const zoneId = payload.zoneId;
  const vehicleType = String(payload.vehicleType || "").toLowerCase();
  const count = ensurePositiveNumber(payload.count, "Count");
  const startNumber = Math.max(1, Number(payload.startNumber || 1));
  const padding = Math.max(2, Number(payload.padding || 3));
  const prefix = String(payload.prefix || "").trim().toUpperCase();

  if (!zoneId || !VEHICLE_TYPES.includes(vehicleType)) {
    throw createAppError("Zone and vehicle type are required");
  }

  const zone = await ensureZoneCompatibility(zoneId, vehicleType);
  const slots = [];

  for (let index = 0; index < count; index += 1) {
    const serial = String(startNumber + index).padStart(padding, "0");
    const slotCode = `${prefix || zone.code}-${vehicleType === "car" ? "C" : "B"}${serial}`;
    slots.push({
      zoneId,
      slotCode,
      vehicleType,
      status: "available",
      isActive: true,
      remarks: String(payload.remarks || "").trim(),
    });
  }

  const createdSlots = await ParkingSlot.insertMany(slots, { ordered: true });
  await syncZoneSlotCount(zoneId);

  await logUsage({
    userId,
    zoneId,
    action: "slot_created",
    metadata: {
      zoneCode: zone.code,
      bulk: true,
      count: createdSlots.length,
      firstSlot: createdSlots[0]?.slotCode,
      lastSlot: createdSlots[createdSlots.length - 1]?.slotCode,
    },
  });

  return createdSlots;
};

const updateSlot = async (slotId, payload, userId) => {
  const slot = await ParkingSlot.findById(slotId);
  if (!slot) throw createAppError("Parking slot not found", 404);
  const pendingReservations = await ParkingReservation.countDocuments({
    slotId,
    status: { $in: ACTIVE_RESERVATION_STATUSES },
    reservationEnd: { $gt: new Date() },
  });

  if (payload.vehicleType && payload.vehicleType !== slot.vehicleType && pendingReservations > 0) {
    throw createAppError("Slots with upcoming reservations cannot change vehicle type");
  }

  if (payload.zoneId && String(payload.zoneId) !== String(slot.zoneId) && pendingReservations > 0) {
    throw createAppError("Slots with upcoming reservations cannot move to another zone");
  }

  const nextVehicleType = payload.vehicleType
    ? String(payload.vehicleType).toLowerCase()
    : slot.vehicleType;

  if (!VEHICLE_TYPES.includes(nextVehicleType)) {
    throw createAppError("Vehicle type is invalid");
  }

  const zone = await ensureZoneCompatibility(payload.zoneId || slot.zoneId, nextVehicleType);

  if (payload.status && !SLOT_STATUSES.includes(payload.status)) {
    throw createAppError("Slot status is invalid");
  }

  if (
    payload.status &&
    ["occupied", "reserved"].includes(payload.status) &&
    payload.status !== slot.status
  ) {
    throw createAppError("Reserved and occupied states are controlled by reservations");
  }

  if (payload.slotCode !== undefined) slot.slotCode = String(payload.slotCode || "").trim().toUpperCase();
  if (payload.zoneId !== undefined) slot.zoneId = payload.zoneId;
  if (payload.vehicleType !== undefined) slot.vehicleType = nextVehicleType;
  if (payload.remarks !== undefined) slot.remarks = String(payload.remarks || "").trim();
  if (payload.isActive !== undefined) slot.isActive = parseBoolean(payload.isActive, true);
  if (payload.status !== undefined) {
    if (ACTIVE_RESERVATION_STATUSES.includes(slot.status) && payload.status !== slot.status) {
      throw createAppError("Active reservation slots cannot be changed manually");
    }
    slot.status = payload.status;
    slot.lastStatusChangedAt = new Date();
  }

  await slot.save();
  await syncZoneSlotCount(slot.zoneId);

  await logUsage({
    userId,
    slotId: slot._id,
    zoneId: slot.zoneId,
    action: "slot_updated",
    metadata: { slotCode: slot.slotCode, zoneCode: zone.code, status: slot.status },
  });

  return slot.populate("zoneId", "name code status supportedVehicleTypes locationDescription");
};

const deleteSlot = async (slotId, userId) => {
  const slot = await ParkingSlot.findById(slotId);
  if (!slot) throw createAppError("Parking slot not found", 404);
  const pendingReservations = await ParkingReservation.countDocuments({
    slotId,
    status: { $in: ACTIVE_RESERVATION_STATUSES },
    reservationEnd: { $gt: new Date() },
  });
  if (pendingReservations > 0) {
    throw createAppError("Cannot delete a slot with active or upcoming reservations");
  }

  await ParkingSlot.deleteOne({ _id: slotId });
  await syncZoneSlotCount(slot.zoneId);

  await logUsage({
    userId,
    slotId,
    zoneId: slot.zoneId,
    action: "slot_deleted",
    metadata: { slotCode: slot.slotCode },
  });
};

const updateSlotStatus = async (slotId, status, userId) => {
  if (!MANUAL_SLOT_STATUSES.includes(status)) {
    throw createAppError("Manual status must be available, unavailable, or maintenance");
  }

  const slot = await ParkingSlot.findById(slotId);
  if (!slot) throw createAppError("Parking slot not found", 404);
  if (ACTIVE_RESERVATION_STATUSES.includes(slot.status) && slot.status !== status) {
    throw createAppError("Reserved or occupied slots cannot be changed manually");
  }

  slot.status = status;
  slot.lastStatusChangedAt = new Date();
  if (status === "available") {
    slot.activeReservationId = null;
    slot.reservedUntil = null;
  }
  await slot.save();

  await logUsage({
    userId,
    slotId,
    zoneId: slot.zoneId,
    action: "slot_status_changed",
    metadata: { slotCode: slot.slotCode, status },
  });

  return slot.populate("zoneId", "name code status supportedVehicleTypes locationDescription");
};

const listReservations = async (filters = {}) => {
  await releaseExpiredReservations();
  const query = buildReservationQuery(filters);
  const reservations = await ParkingReservation.find(query)
    .populate("userId", "name email role")
    .populate("slotId", "slotCode status vehicleType")
    .populate("zoneId", "name code locationDescription")
    .sort({ createdAt: -1 })
    .lean();
  return reservations.map(attachReservationMeta);
};

const computeOverviewCounts = async (slotQuery = {}) => {
  const aggregation = await ParkingSlot.aggregate([
    { $match: { ...slotQuery } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const counts = {
    available: 0,
    occupied: 0,
    reserved: 0,
    unavailable: 0,
    maintenance: 0,
  };

  aggregation.forEach((item) => {
    counts[item._id] = item.count;
  });

  return counts;
};

const getAdminDashboard = async (filters = {}) => {
  await releaseExpiredReservations();
  await syncAllSlotLiveStatuses();
  const slotQuery = {};
  if (filters.zoneId) slotQuery.zoneId = new mongoose.Types.ObjectId(filters.zoneId);
  if (filters.vehicleType) slotQuery.vehicleType = filters.vehicleType;

  const [zones, slotCounts, recentReservations, slotTotal] = await Promise.all([
    ParkingZone.countDocuments(),
    computeOverviewCounts(slotQuery),
    ParkingReservation.find(buildReservationQuery(filters))
      .populate("userId", "name email role")
      .populate("slotId", "slotCode status vehicleType")
      .populate("zoneId", "name code locationDescription")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    ParkingSlot.countDocuments(slotQuery),
  ]);

  return {
    summary: {
      totalZones: zones,
      totalSlots: slotTotal,
      availableSlots: slotCounts.available,
      occupiedSlots: slotCounts.occupied,
      reservedSlots: slotCounts.reserved,
      unavailableSlots: slotCounts.unavailable + slotCounts.maintenance,
    },
    recentReservations: recentReservations.map(attachReservationMeta),
    liveStatus: slotCounts,
    generatedAt: new Date().toISOString(),
  };
};

const getUsageAnalytics = async (filters = {}) => {
  await releaseExpiredReservations();
  await syncAllSlotLiveStatuses();
  const reservationQuery = buildReservationQuery(filters);
  const slotQuery = {};
  if (filters.zoneId) slotQuery.zoneId = filters.zoneId;
  if (filters.vehicleType) slotQuery.vehicleType = filters.vehicleType;
  if (filters.slotId) slotQuery._id = filters.slotId;

  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);

  const [slotCounts, reservations, logs, zoneBreakdown] = await Promise.all([
    computeOverviewCounts(slotQuery),
    ParkingReservation.find(reservationQuery)
      .populate("userId", "name email")
      .populate("slotId", "slotCode vehicleType")
      .populate("zoneId", "name code")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    ParkingUsageLog.find({
      ...(filters.zoneId ? { zoneId: filters.zoneId } : {}),
      ...(filters.slotId ? { slotId: filters.slotId } : {}),
    })
      .sort({ actionTime: -1 })
      .limit(100)
      .lean(),
    ParkingSlot.aggregate([
      { $match: slotQuery },
      {
        $lookup: {
          from: "parkingzones",
          localField: "zoneId",
          foreignField: "_id",
          as: "zone",
        },
      },
      { $unwind: "$zone" },
      {
        $group: {
          _id: "$zoneId",
          zoneName: { $first: "$zone.name" },
          zoneCode: { $first: "$zone.code" },
          totalSlots: { $sum: 1 },
          availableSlots: { $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] } },
          occupiedSlots: { $sum: { $cond: [{ $eq: ["$status", "occupied"] }, 1, 0] } },
          reservedSlots: { $sum: { $cond: [{ $eq: ["$status", "reserved"] }, 1, 0] } },
          unavailableSlots: {
            $sum: { $cond: [{ $in: ["$status", ["unavailable", "maintenance"]] }, 1, 0] },
          },
        },
      },
      { $sort: { zoneName: 1 } },
    ]),
  ]);

  return {
    summary: {
      currentOccupancy: slotCounts.occupied,
      dailyUsage: reservations.filter((item) => new Date(item.createdAt) >= dayStart).length,
      zoneCount: zoneBreakdown.length,
      availableSlots: slotCounts.available,
      reservedSlots: slotCounts.reserved,
    },
    zoneBreakdown,
    slotHistory: reservations.map(attachReservationMeta),
    reservationLogs: logs,
  };
};

const getPublicOverview = async (filters = {}) => {
  await releaseExpiredReservations();
  const now = new Date();
  const reservationStart = filters.reservationStart
    ? parseDateValue(filters.reservationStart, "Reservation start")
    : now;
  const reservationEnd = filters.reservationEnd
    ? parseDateValue(filters.reservationEnd, "Reservation end")
    : new Date(now.getTime() + 2 * 60 * 60 * 1000);

  if (reservationEnd <= reservationStart) {
    throw createAppError("Reservation end must be later than reservation start");
  }

  const slotQuery = { isActive: true };
  if (filters.zoneId) slotQuery.zoneId = filters.zoneId;
  if (filters.vehicleType) slotQuery.vehicleType = filters.vehicleType;

  const [zones, candidateSlots] = await Promise.all([
    ParkingZone.find({ status: "active" }).sort({ name: 1 }).lean(),
    ParkingSlot.find(slotQuery)
      .populate("zoneId", "name code locationDescription")
      .sort({ slotCode: 1 })
      .lean(),
  ]);

  const slotIds = candidateSlots.map((slot) => slot._id);
  const overlappingReservations = slotIds.length
    ? await ParkingReservation.find(
        buildOverlapReservationQuery({
          slotIds,
          reservationStart,
          reservationEnd,
        })
      )
        .select("slotId status reservationStart reservationEnd")
        .lean()
    : [];

  const overlapMap = new Map();
  overlappingReservations.forEach((reservation) => {
    overlapMap.set(String(reservation.slotId), reservation);
  });

  const slots = candidateSlots.map((slot) => {
    const conflict = overlapMap.get(String(slot._id));
    const availabilityStatus = ["unavailable", "maintenance"].includes(slot.status)
      ? slot.status
      : conflict
        ? conflict.status === "occupied"
          ? "occupied"
          : "reserved"
        : "available";

    return {
      ...slot,
      availabilityStatus,
      conflictingReservation: conflict
        ? {
            reservationStart: conflict.reservationStart,
            reservationEnd: conflict.reservationEnd,
            status: conflict.status,
          }
        : null,
    };
  });

  const filteredSlots =
    filters.availability && SLOT_STATUSES.includes(filters.availability)
      ? slots.filter((slot) => slot.availabilityStatus === filters.availability)
      : slots;

  const counts = {
    available: 0,
    occupied: 0,
    reserved: 0,
    unavailable: 0,
    maintenance: 0,
  };

  slots.forEach((slot) => {
    counts[slot.availabilityStatus] = (counts[slot.availabilityStatus] || 0) + 1;
  });

  return {
    zones,
    slots: filteredSlots,
    counts,
    selectedRange: {
      reservationStart: reservationStart.toISOString(),
      reservationEnd: reservationEnd.toISOString(),
    },
    generatedAt: new Date().toISOString(),
  };
};

const createReservation = async (payload, userId) => {
  await releaseExpiredReservations();

  const user = await User.findById(userId).lean();
  if (!user) throw createAppError("User account not found", 404);

  const slotId = payload.slotId;
  const vehicleType = String(payload.vehicleType || "").toLowerCase();
  const reservationStart = payload.reservationStart
    ? parseDateValue(payload.reservationStart, "Reservation start")
    : new Date();
  const reservationEnd = parseDateValue(payload.reservationEnd, "Reservation end");
  const notes = String(payload.remarks || payload.notes || "").trim();

  if (!slotId || !VEHICLE_TYPES.includes(vehicleType)) {
    throw createAppError("Slot and vehicle type are required");
  }
  if (reservationEnd <= reservationStart) {
    throw createAppError("Reservation end must be later than reservation start");
  }

  const { slot, token } = await acquireSlotBookingLock(slotId);

  if (slot.vehicleType !== vehicleType) {
    await releaseSlotBookingLock(slotId, token);
    throw createAppError("Selected slot does not support this vehicle type");
  }

  if (!slot.zoneId || slot.zoneId.status !== "active") {
    await releaseSlotBookingLock(slotId, token);
    throw createAppError("Selected zone is inactive");
  }

  if (!slot.zoneId.supportedVehicleTypes.includes(vehicleType)) {
    await releaseSlotBookingLock(slotId, token);
    throw createAppError("Selected zone does not support this vehicle type");
  }

  if (!slot.isActive || ["unavailable", "maintenance"].includes(slot.status)) {
    await releaseSlotBookingLock(slotId, token);
    throw createAppError("This slot is currently unavailable for booking", 409);
  }

  try {
    const overlappingReservation = await ParkingReservation.findOne(
      buildOverlapReservationQuery({
        slotId,
        reservationStart,
        reservationEnd,
      })
    ).lean();

    if (overlappingReservation) {
      throw createAppError(
        "This slot is already booked for the selected date and time range. Please choose another slot.",
        409
      );
    }

    const reservation = await ParkingReservation.create({
      userId,
      slotId,
      zoneId: slot.zoneId._id,
      vehicleType,
      reservationStart,
      reservationEnd,
      status: "reserved",
      bookedAt: new Date(),
      expiresAt: reservationEnd,
      remarks: notes,
      zoneSnapshot: {
        name: slot.zoneId.name,
        code: slot.zoneId.code,
        locationDescription: slot.zoneId.locationDescription,
      },
      slotSnapshot: {
        slotCode: slot.slotCode,
      },
    });

    await Notification.create({
      title: "Parking slot booking confirmed",
      message: "Parking slot booking confirmed",
      userId,
      type: "info",
      isRead: false,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    await syncSlotLiveStatus(slotId, new Date());

    await logUsage({
      reservationId: reservation._id,
      userId,
      slotId,
      zoneId: slot.zoneId._id,
      action: "reservation_created",
      metadata: {
        slotCode: slot.slotCode,
        zoneCode: slot.zoneId.code,
        vehicleType,
        reservationStart,
        reservationEnd,
      },
    });

    return ParkingReservation.findById(reservation._id)
      .populate("userId", "name email role")
      .populate("slotId", "slotCode status vehicleType")
      .populate("zoneId", "name code locationDescription")
      .lean()
      .then(attachReservationMeta)
      .finally(() => releaseSlotBookingLock(slotId, token));
  } catch (error) {
    await releaseSlotBookingLock(slotId, token);
    throw error;
  }
};

const updateReservationLifecycle = async (reservationId, nextStatus, userId, actorType = "user") => {
  await releaseExpiredReservations();
  const reservation = await ParkingReservation.findById(reservationId)
    .populate("slotId", "slotCode status vehicleType")
    .populate("zoneId", "name code locationDescription")
    .populate("userId", "name email role");

  if (!reservation) throw createAppError("Reservation not found", 404);
  if (actorType === "user" && String(reservation.userId._id) !== String(userId)) {
    throw createAppError("You can only update your own reservation", 403);
  }

  const now = new Date();
  const updates = {};
  let usageAction = null;

  if (nextStatus === "cancelled") {
    if (reservation.status !== "reserved") throw createAppError("Only reserved bookings can be cancelled");
    updates.status = "cancelled";
    updates.cancelledAt = now;
    usageAction = "reservation_cancelled";
  } else if (nextStatus === "occupied") {
    if (reservation.status !== "reserved") throw createAppError("Only reserved bookings can be checked in");
    updates.status = "occupied";
    updates.checkedInAt = now;
    usageAction = "reservation_checked_in";
  } else if (nextStatus === "completed") {
    if (reservation.status !== "occupied") throw createAppError("Only occupied bookings can be checked out");
    updates.status = "completed";
    updates.checkedOutAt = now;
    usageAction = "reservation_checked_out";
  } else {
    throw createAppError("Unsupported reservation status change");
  }

  await ParkingReservation.updateOne({ _id: reservation._id }, { $set: updates });
  await syncSlotLiveStatus(reservation.slotId._id, now);

  await logUsage({
    reservationId: reservation._id,
    userId: reservation.userId._id,
    slotId: reservation.slotId._id,
    zoneId: reservation.zoneId._id,
    action: usageAction,
    metadata: {
      slotCode: reservation.slotId.slotCode,
      zoneCode: reservation.zoneId.code,
      actorType,
      changedBy: userId,
    },
  });

  const updated = await ParkingReservation.findById(reservation._id)
    .populate("userId", "name email role")
    .populate("slotId", "slotCode status vehicleType")
    .populate("zoneId", "name code locationDescription")
    .lean();

  return attachReservationMeta(updated);
};

const listMyReservations = async (userId, filters = {}) => {
  await releaseExpiredReservations();
  const reservations = await ParkingReservation.find(buildReservationQuery({ ...filters, userId }))
    .populate("slotId", "slotCode status vehicleType")
    .populate("zoneId", "name code locationDescription")
    .sort({ createdAt: -1 })
    .lean();
  return reservations.map(attachReservationMeta);
};

const getParkingBootstrap = async () => {
  const [zoneCount, slotCount] = await Promise.all([
    ParkingZone.countDocuments(),
    ParkingSlot.countDocuments(),
  ]);
  return {
    hasData: zoneCount > 0 || slotCount > 0,
    zoneCount,
    slotCount,
  };
};

const seedParkingSampleData = async () => {
  const bootstrap = await getParkingBootstrap();
  if (bootstrap.hasData) return bootstrap;

  const zones = await ParkingZone.insertMany([
    {
      name: "Main Gate",
      code: "MG",
      description: "Near the main gate and visitor counter",
      locationDescription: "Main gate entrance",
      supportedVehicleTypes: ["car", "bike"],
      status: "active",
      notes: "Shared zone for staff and visitors",
    },
    {
      name: "Library Wing",
      code: "LW",
      description: "Student parking near the library block",
      locationDescription: "Library side access road",
      supportedVehicleTypes: ["bike"],
      status: "active",
      notes: "Bike-focused zone",
    },
  ]);

  const slots = [];
  for (let index = 1; index <= 6; index += 1) {
    slots.push({
      zoneId: zones[0]._id,
      slotCode: `MG-C${String(index).padStart(3, "0")}`,
      vehicleType: "car",
      status: "available",
      isActive: true,
    });
  }
  for (let index = 1; index <= 8; index += 1) {
    slots.push({
      zoneId: zones[1]._id,
      slotCode: `LW-B${String(index).padStart(3, "0")}`,
      vehicleType: "bike",
      status: "available",
      isActive: true,
    });
  }

  await ParkingSlot.insertMany(slots);
  await Promise.all(zones.map((zone) => syncZoneSlotCount(zone._id)));
  return getParkingBootstrap();
};

const startParkingExpiryWorker = () => {
  const intervalMs = Number(process.env.PARKING_EXPIRY_CHECK_MS || 60000);
  return setInterval(() => {
    Promise.all([releaseExpiredReservations(), syncAllSlotLiveStatuses()])
      .catch((error) => {
        console.error("Parking expiry worker failed:", error.message);
      });
  }, intervalMs);
};

module.exports = {
  bulkCreateSlots,
  createReservation,
  createSlot,
  createZone,
  deleteSlot,
  deleteZone,
  getAdminDashboard,
  getParkingBootstrap,
  getPublicOverview,
  getUsageAnalytics,
  listMyReservations,
  listReservations,
  listSlots,
  listZones,
  releaseExpiredReservations,
  seedParkingSampleData,
  startParkingExpiryWorker,
  updateReservationLifecycle,
  updateSlot,
  updateSlotStatus,
  updateZone,
};
