// npm i nodemailer
const nodemailer = require("nodemailer");

//  Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: "gmail", // Gmail use ho raha hai
    auth: {
        user: process.env.EMAIL, 
        pass: process.env.PASSWORD 
    }
});

const sendEmail = async (mailOptions) => {
    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, response: info.response };
    } catch (error) {
        return { success: false, error: error };
    }
};

module.exports = { sendEmail };
