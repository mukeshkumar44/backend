const express = require("express");
const User = require("../models/user");
const { sendEmail } = require("../config/emailConfig");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const router = express.Router(); 
function generateOTP() {
    const otp = crypto.randomInt(100000, 999999);
    return otp.toString();
}
router.post("/users", async (req, res) => {
    try {
        const { name, email, password, dob, phone } = req.body;

        if (!name || !email || !password || !dob || !phone) {
            return res.status(400).json({ message: "Sabhi fields required hain" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const otp = generateOTP();
        console.log(`Generated OTP: ${otp}`);

        const otpToken = jwt.sign({ email, otp },
            process.env.JWT_SECRET, { expiresIn: "10m" });
        await sendEmail(email, otp);   // Using sendEmail2

        // Create a new user with isEmailVerified = false
        const newUser = new User({ 
            name, 
            email, 
            password, 
            dob, 
            phone,
            isEmailVerified: false 
        });
        await newUser.save();

        
        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "User created successfully. OTP sent to email.",
            otpToken,  
            token
        });

    } catch (error) {
        console.error("Error creating User:", error.message);
        res.status(500).json({ message: "Error creating User", error: error.message });
    }
});

// Verify OTP Route
// Verify OTP Route
router.post('/users/verify-otp', async (req, res) => {
    const { otpToken, userOtp } = req.body;
    if (!otpToken || !userOtp) {
        return res.status(400).json({ message: "OTP Token and OTP are required" });
    }

    try {
        const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

        if (!decoded || decoded.otp !== userOtp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const email = decoded.email;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isEmailVerified = true;
        await user.save();
        return res.status(200).json({ message: "Email verified successfully", user });

    } catch (error) {
        console.error("OTP Verification Error:", error.message);
        return res.status(500).json({ message: "OTP verification failed or OTP has expired", error: error.message });
    }
});

router.post("/users/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required!" });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: "Login successful!", token });

    } catch (error) {
        console.error("Login failed:", error.message);
        res.status(500).json({ message: "Login failed", error: message });
    }
});
// Create a router for GET all users
router.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: "Error fetching Users", error });
    }
});

// Create a router for GET a single user by ID
router.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching User", error });
    }
});

// Create a router for PUT (Update User)
router.put("/users/:id", async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully", updatedUser });

    } catch (error) {
        res.status(500).json({ message: "Error updating User", error });
    }
});

// Create a router for PATCH (Partial Update User)
router.patch("/users/:id", async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully", updatedUser });

    } catch (error) {
        res.status(500).json({ message: "Error updating User", error });
    }
});

// Create a router for DELETE (Delete User)
router.delete("/users/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully", user });

    } catch (error) {
        res.status(500).json({ message: "Error deleting User", error });
    }
});

module.exports = router;
