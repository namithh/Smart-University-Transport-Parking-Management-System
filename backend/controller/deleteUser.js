const userModel = require("../models/userModel");

async function deleteUser(req, res) {
    try {
        const { userId } = req.body;
        const deletedUser = await userModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                error: true
            });
        }

        res.json({
            message: "User deleted successfully",
            success: true,
            error: false
        });
    } catch (err) {
        res.status(500).json({
            message: err.message || err,
            success: false,
            error: true
        });
    }
}

module.exports = deleteUser;