const express = require('express');
const router = express.Router();
const Attendance = require('../models/bus/Attendance');

// Route to save attendance
router.post('/mark', async (req, res) => {
    try {
        const { memberId } = req.body;

        // Check if already marked within the last hour
        const recentScan = await Attendance.findOne({
            memberId,
            scanTime: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // 1 hour limit
        });

        if (recentScan) {
            return res.status(400).json({ message: "Already marked recently!" });
        }

        const newAttendance = new Attendance({ memberId });
        await newAttendance.save();

        res.status(201).json({ message: "Attendance marked successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Route to get attendance records
router.get('/records/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const records = await Attendance.find({
            scanTime: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ scanTime: -1 });

        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
