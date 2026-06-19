const userModel = require("../models/userModel")
const bcrypt = require("bcryptjs")

const updateUserdetails = async (req, res) => {
    try {
        const userId = req.userId   // ✅ from authToken
        const { name, email, password } = req.body

        console.log("Logged userId:", userId)

        const user = await userModel.findById(userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        user.name = name || user.name
        user.email = email || user.email

        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
            user.password = hashedPassword
        }

        await user.save()

        return res.json({
            success: true,
            message: "User updated successfully"
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

module.exports = updateUserdetails