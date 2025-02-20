const express = require('express');
const Seller = require('../models/seller');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Fixed spelling from becrypt to bcrypt
const {generateOTP,sendEmail2}=require("../utils/sendOTP");
const { sendEmail } = require("../config/emailConfig");
// const authmiddleware = require('../Middleware/authmiddleware');

const router = express.Router();

// verified otp route
router.post('/verify_otp', async (req, res) => {
    try {
        const {otpToken,otp}=req.body;
        //verify token
        const decoded=jwt.verify(otpToken,process.env.JWT_SECRET);

        if(!decoded || decoded.otp !== otp){
          return  res.status(400).json({message:"OTP invalied or expired token"});
        }
       const email = decoded.email;
       const user = await Seller.findOne({ email });
       user.isEmailVerified = true;
         await user.save();
         return res.status(200).json({ message: "OTP verified successfully",createdUser:user});


    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error: error.message });
    }
});

// Create new seller
router.post('/seller', async (req, res) => {
    try {
        const { name, email, password, storename, address, contact } = req.body;
        if (!name || !email || !password || !storename || !address || !contact) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingSeller = await Seller.findOne({ email });
        if (existingSeller) {
            return res.status(400).json({ message: "Seller already exists" });
        }

        // Hashing password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log(hashedPassword);
         //otp genrate
        const otp = generateOTP();
        console.log(otp);
        
        const otpToken=jwt.sign({email,otp},
            process.env.JWT_SECRET,{expiresIn:"10m"});
            console.log(otpToken);
          await sendEmail2(email,otp);

        const newSeller = new Seller({ name, email, password: hashedPassword, storename, address, contact });
        const result = await newSeller.save();
        
        // Sending email
        // const mailOptions = {
        //     from: process.env.EMAIL,
        //     to: email,
        //     subject: "Welcome to our e-commerce website",
        //     text: `Hello ${name}, thank you for registering in our app. Welcome to our platform. Hope you will like our services.`,
        // };

        // const emailResult = await sendEmail(mailOptions);
        // if (!emailResult.success) {
        //     return res.status(500).json({ message: "Error sending email", error: emailResult.error });
        // }

        res.status(201).json({ message: "Seller created successfully", seller: newSeller });

    } catch (error) {
        res.status(500).json({ message: "Error creating Seller", error: error.message });
    }
});

// Seller login route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const seller = await Seller.findOne({ email });
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required!" });
        }
         // Check if email is verified
         if (!seller.isEmailVerified) {
            return res.status(400).json({ message: "Email is not verified!" });
        }
              
         const result = bcrypt.compare(seller.password, password);
        if (result === false) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Password comparison using bcrypt
        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password!" });
        }
        

        const token = jwt.sign(
            { sellerId: seller._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        

        res.status(200).json({ message: "Login successful!", token });

    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
});

// Get all sellers
router.get('/seller', async (req, res) => {
    try {
        const sellers = await Seller.find();
        res.status(200).json({ sellers });
    } catch (error) {
        res.status(500).json({ message: "Error fetching Sellers", error: error.message });
    }
});

// Get seller by ID
router.get("/seller/:id", async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }
        res.status(200).json(seller);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Seller", error: error.message });
    }
});

// Update seller by PUT
router.put("/seller/:id", async (req, res) => {
    try {
        const updatedSeller = await Seller.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSeller) {
            return res.status(404).json({ message: "Seller not found" });
        }
        res.status(200).json({ message: "Seller updated successfully", updatedSeller });
    } catch (error) {
        res.status(500).json({ message: "Error updating Seller", error: error.message });
    }
});

// Update seller by PATCH
router.patch("/seller/:id", async (req, res) => {
    try {
        const updatedSeller = await Seller.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSeller) {
            return res.status(404).json({ message: "Seller not found" });
        }
        res.status(200).json({ message: "Seller updated successfully", updatedSeller });
    } catch (error) {
        res.status(500).json({ message: "Error updating Seller", error: error.message });
    }
});

// Delete seller
router.delete("/seller/:id", async (req, res) => {
    try {
        const deletedSeller = await Seller.findByIdAndDelete(req.params.id);
        if (!deletedSeller) {
            return res.status(404).json({ message: "Seller not found" });
        }
        res.status(200).json({ message: "Seller deleted successfully", deletedSeller });
    } catch (error) {
        res.status(500).json({ message: "Error deleting Seller", error: error.message });
    }
});

module.exports = router;
