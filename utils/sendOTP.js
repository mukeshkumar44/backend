const crypto = require('crypto');
const nodemailer = require('nodemailer');

//otp genrate function
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

const sendEmail2 = async (email,otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'OTP for password reset',
            text: `Your OTP for password reset is ${otp}  this otp is valid for 10 minutes`
        };

        const result = await transporter.sendMail(mailOptions);
        return { success: true, result };
    } catch (error) {
        return { success: false, error };
    }
};
module.exports = { generateOTP, sendEmail2 };