const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    memberId: { type: String, required: true }, // Store scanned member ID
    scanTime: { type: Date, default: Date.now } // Timestamp of scan
});

module.exports = mongoose.model('Attendance', attendanceSchema);
