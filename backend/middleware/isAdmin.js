const userModel = require("../models/userModel");

async function isAdmin(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Unauthorized",
      });
    }
    const user = await userModel.findById(req.userId);
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Admin access required",
      });
    }
    req.userRole = user.role;
    next();
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message || err,
    });
  }
}

module.exports = isAdmin;
