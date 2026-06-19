const Payment = require("../../models/payment/Payment");

// Get all payments (admin view)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')  // Populating user details
      .populate('packageId', 'name');   // Populating package details
    
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments.' });
  }
};

// Admin manually updates payment status
exports.adminUpdatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const payment = await Payment.findByIdAndUpdate(id, { status }, { new: true });
    if (!payment) return res.status(404).json({ error: "Payment not found." });

    res.status(200).json({ message: "Payment status updated", payment });
  } catch (err) {
    res.status(500).json({ error: "Failed to update payment." });
  }
};
