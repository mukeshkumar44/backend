const express = require("express");
const User = require("../models/user");

const router = express.Router();

router.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email aur password required hain!" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User does not exist!"); 
            return res.status(404).json({ message: "User exist nahi karta!" });
        }

        if (password !== user.password) {
            return res.status(400).json({ message: "Galat password!" });
        }

        res.status(200).json({ message: "Login successful!", user });

    } catch (error) {
        res.status(500).json({ message: "Login failed", error });
    }
});

module.exports = router;
