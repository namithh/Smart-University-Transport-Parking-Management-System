const Incident = require("../models/Incident");
const Notification = require("../models/Notification");
const userModel = require("../models/userModel");

async function createIncident(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Unauthorized",
      });
    }
    const { title, description, type, customType, location } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Title, description, and type are required",
      });
    }

    if (type === "other") {
      if (!customType || !String(customType).trim()) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "customType is required when type is 'other'",
        });
      }
    }

    const incident = new Incident({
      title,
      description,
      type,
      customType: type === "other" ? customType.trim() : undefined,
      location: location || "",
      reportedBy: req.userId,
      status: "Pending",
    });

    await incident.save();
    await incident.populate("reportedBy", "name email");

    res.status(201).json({
      success: true,
      error: false,
      message: "Incident reported successfully",
      data: incident,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message || err,
    });
  }
}

async function getAllIncidents(req, res) {
  try {
    const incidents = await Incident.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      error: false,
      data: incidents,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message || err,
    });
  }
}

async function getUserIncidents(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Unauthorized",
      });
    }

    const incidents = await Incident.find({ reportedBy: req.userId })
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      error: false,
      data: incidents,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message || err,
    });
  }
}

async function assignIncident(req, res) {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo || !["Transport Officer", "Parking Security Officer"].includes(assignedTo)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Valid assignedTo officer is required",
      });
    }

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Incident not found",
      });
    }

    incident.assignedTo = assignedTo;
    if (incident.status === "Pending") {
      incident.status = "Assigned";
    }

    await incident.save();
    await incident.populate("reportedBy", "name email");

    res.json({
      success: true,
      error: false,
      message: "Incident assigned successfully",
      data: incident,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message || err,
    });
  }
}

async function updateIncidentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["Pending", "Assigned", "Investigating", "Resolved", "Closed"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Valid status is required",
      });
    }

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Incident not found",
      });
    }

    incident.status = status;
    await incident.save();
    await incident.populate("reportedBy", "name email");

    const notif = new Notification({
      title: "Incident status updated",
      message: `Your incident status has been updated to ${status}`,
      userId: incident.reportedBy,
      type: "info",
      isRead: false,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
    await notif.save();

    res.json({
      success: true,
      error: false,
      message: "Status updated successfully",
      data: incident,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message || err,
    });
  }
}

async function deleteIncident(req, res) {
  try {
    const { id } = req.params;
    const incident = await Incident.findByIdAndDelete(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Incident not found",
      });
    }
    res.json({
      success: true,
      error: false,
      message: "Incident deleted",
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
  createIncident,
  getAllIncidents,
  getUserIncidents,
  assignIncident,
  updateIncidentStatus,
  deleteIncident,
};
