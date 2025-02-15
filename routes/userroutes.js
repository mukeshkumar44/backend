const express = require("express");
const User = require("../models/user");
const { sendEmail } = require("../config/emailConfig");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router(); // Method for routing
function generateOTP() {
    const otp = crypto.randomInt(100000, 999999); // generates a six-digit random number
    return otp.toString();
}

// Create a router for POST
router.post("/users", async (req, res) => {
    try {
        const { name, email, password, dob, phone } = req.body;
        
        // Check if all fields are filled
        if (!name || !email || !password || !dob || !phone) {
            return res.status(400).json({ message: "Sabhi fields required hain" });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });

        }
        const otp = generateOTP();
        console.log(otp);
        
        const otpToken=jwt.sign({email,otp},
            process.env.JWT_SECRET,{expiresIn:"10m"});
            console.log(otpToken);
          await sendEmail(email,otp);

        // Create a new user
        const newUser = new User({ name, email, password, dob, phone });
        await newUser.save();

        // Generate JWT Token
        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Email Options
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Welcome to our e-commerce website",
            text: `Hello ${name}, thank you for registering in our app. Welcome to our platform. Hope you will like our services.`,
        };

        const emailResult = await sendEmail(mailOptions);

        res.status(200).json({ 
            message: "User created successfully and email sent successfully", emailResult,
            token 
        });

    } catch (error) {
        res.status(500).json({ message: "Error creating User", error });
    }
});
router.post('/users/verify-otp',async(req,res)=>{
    const{token,userOtp}=req.body;
    try {
         const decoded = jwt.verify(token,process.env.JWT_SECRET);
         if(decoded.otp=== userOtp){
            // ye line tab add karni hai jab aap ye chahte hai ki jab tak otp verify na ho tab tak login route access na ho 
            await User.updateOne({ email: decoded.email }, { isEmailVerified: true });
            res.status(200).json({message:"OTP Verified Successfully"});
         }else{
            res.status(400).json({message:"Invalid OTP , please try again."})
         }
    } catch (error) {
        return res.status(500).json({message:"Otp verification Failed or Otp has expired"})
    }
})
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
            {id: user._id,email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: "Login successful!", token });

    } catch (error) {
        console.error("Login failed:", error.message);
        res.status(500).json({ message: "Login failed", error:message });
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
