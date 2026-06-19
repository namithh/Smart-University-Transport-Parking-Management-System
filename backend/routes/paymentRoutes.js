/*const express = require("express");
const paymentController = require ('../controller/payment/paymentController');

const router = express.Router();

router.post("/create", paymentController.createPayment);
router.post("/update-status", paymentController.updatePaymentStatus); // Optional for IPN

module.exports = router; */

// routes/paymentRoutes.js or similar
const express = require("express");
const crypto = require("crypto");
const paymentController = require("../controller/payment/paymentController");

const router = express.Router();

const MERCHANT_SECRET = "OTk2NTQxNzA2MTM4MDY5Nzc4ODM4NjAxNjc0OTQxNjE4MDY4MzAw"; // replace with actual

// Admin routes
router.get("/", paymentController.getAllPayments);
router.put("/:id", paymentController.adminUpdatePaymentStatus);

// PayHere IPN route
router.post("/ipn", (req, res) => {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig
  } = req.body;

  const localMd5Sig = crypto
    .createHash("md5")
    .update(
      merchant_id +
      order_id +
      payhere_amount +
      payhere_currency +
      status_code +
      crypto.createHash("md5").update(MERCHANT_SECRET).digest("hex")
    )
    .digest("hex")
    .toUpperCase();

  if (localMd5Sig !== md5sig) {
    console.log("❌ Invalid signature: possible spoofing attempt");
    return res.status(403).send("Invalid signature");
  }

  if (status_code === '2') {
    console.log("✅ Payment completed!");
    // TODO: Update payment in DB by order_id
  } else {
    console.log("⚠ Payment failed or pending");
  }

  res.status(200).send("IPN received");
});

module.exports = router;
