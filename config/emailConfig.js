// npm i nodemailer
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    //gmail, yahoo, outlook, etc
    service: 'gmail',
    auth: {
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    }
});


//function to send email

//mail options -> kisko mail bhejni hai -> subject -> body
const sendEmail =async (mailoptions)=>{
    try{
        const info = await transporter.sendMail(mailoptions);
        return{success:true,response:info.response}

    }catch(error){
        return{success:false,error:error}
    }
}
module.exports = sendEmail;