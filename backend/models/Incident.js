const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["transport", "parking", "other"],
      required: true,
    },
    customType: { type: String },
    location: { type: String, default: "" },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: true,
    },
    assignedTo: {
      type: String,
      enum: ["Transport Officer", "Parking Security Officer"],
    },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "Investigating", "Resolved", "Closed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Incident", incidentSchema);
