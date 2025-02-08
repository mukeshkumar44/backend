// npm i nodemailer
const nodemailer = require("nodemailer");

//  Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: "gmail", // Gmail use ho raha hai
    auth: {
        user: process.env.EMAIL, //  Sender Email (from .env file)
        pass: process.env.PASSWORD //  Email Password (from .env file)
    }
});

const sendEmail = async (mailOptions) => {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response); // Debugging ke liye
        return { success: true, response: info.response };
    } catch (error) {
        console.error("Email sending error:", error); // Error Logging
        return { success: false, error: error };
    }
};

module.exports = { sendEmail };
