const mongoose = require("mongoose");

const financialSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    type: { 
      type: String, 
      enum: ["Income", "Outcome"], 
      required: true 
    },
    category: { 
      type: String, 
      enum: [
        "Ticket Sales",
        "Online Bookings",
        "Package Delivery",
        "Maintenance",
        "Fuel",
        "Staff Salaries",
        "Administrative Expenses",
        "Insurance",
        "Taxes",
        "Other Income",
        "Other Expenses"
      ], 
      required: true 
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Card Payment", "Digital Wallet"],
      required: true
    },
    reference: { type: String, default: "" },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }
  },
  { timestamps: true }
);

// Index for efficient date-based queries
financialSchema.index({ date: 1 });

const Financial = mongoose.model("Financial", financialSchema);

module.exports = Financial;