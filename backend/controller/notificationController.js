const Notification = require("../models/Notification");
const mongoose = require("mongoose");

function isReadForUser(doc, userId) {
  const uid = userId.toString();
  if (doc.userId) {
    return !!doc.isRead;
  }
  return (doc.readBy || []).some((id) => id.toString() === uid);
}

function serializeNotification(doc, userId) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    ...o,
    isReadForUser: isReadForUser(doc, userId),
  };
}

async function createNotification(req, res) {
  try {
    const { title, message, type, expiryDate, audience, userId: targetUserId } = req.body;

    if (!title || !message || !expiryDate) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Title, message, and expiryDate are required",
      });
    }

    const exp = new Date(expiryDate);
    if (Number.isNaN(exp.getTime())) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid expiryDate",
      });
    }

    const notifType = ["info", "warning", "emergency"].includes(type) ? type : "info";

    if (audience === "specific") {
      if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Valid userId is required for specific audience",
        });
      }
      const n = await Notification.create({
        title,
        message,
        type: notifType,
        userId: targetUserId,
        isRead: false,
        expiryDate: exp,
      });
      return res.status(201).json({
        success: true,
        error: false,
        message: "Notification created",
        data: n,
      });
    }

    const n = await Notification.create({
      title,
      message,
      type: notifType,
      userId: null,
      isRead: false,
      readBy: [],
      expiryDate: exp,
    });

    res.status(201).json({
      success: true,
      error: false,
      message: "Notification created",
      data: n,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message || err,
    });
  }
}

async function getUserNotifications(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Unauthorized",
      });
    }

    const now = new Date();
    const list = await Notification.find({
      $or: [{ userId: req.userId }, { userId: null }],
      expiryDate: { $gt: now },
    }).sort({ createdAt: -1 });

    const data = list.map((doc) => serializeNotification(doc, req.userId));

    res.json({
      success: true,
      error: false,
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message || err,
    });
  }
}

async function markAsRead(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    const doc = await Notification.findById(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Notification not found",
      });
    }

    if (doc.userId) {
      if (doc.userId.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          error: true,
          message: "Forbidden",
        });
      }
      doc.isRead = true;
    } else {
      const already = (doc.readBy || []).some((x) => x.toString() === req.userId.toString());
      if (!already) {
        doc.readBy.push(req.userId);
      }
    }

    await doc.save();

    res.json({
      success: true,
      error: false,
      message: "Marked as read",
      data: serializeNotification(doc, req.userId),
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message || err,
    });
  }
}

async function getAllNotifications(req, res) {
  try {
    const list = await Notification.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(300);
    res.json({
      success: true,
      error: false,
      data: list,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message || err,
    });
  }
}

async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const n = await Notification.findByIdAndDelete(id);
    if (!n) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Notification not found",
      });
    }
    res.json({
      success: true,
      error: false,
      message: "Notification deleted",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message || err,
    });
  }
}

module.exports = {
  createNotification,
  getUserNotifications,
  getAllNotifications,
  markAsRead,
  deleteNotification,
};
