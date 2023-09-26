require("dotenv").config();
const nodemailer = require("nodemailer");
const {logger} = require("../utils/logger");
const {ErrorHandler} = require("../helpers/error");

const transporter = nodemailer.createTransport({
    port:process.env.SMTP_PORT,
    host:process.env.SMTP_HOST,
    auth: {
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASSWORD,
    },
    secure:true,
});

const url = process.env.NODE_ENV === "development"
            ? "http://ShringarJewellers.netlify.app":
              "http://localhost:3000"; 


const signupMail = async (to, name) => {
    try {
        const message = {
            from : "ShringarJewellers@gmail.com",
            to,
            subject : "Welcome to Shringar Jewellers",
            html: `
            
            `,
        };

        await transporter.sendMail(message);
    } catch(error){
        logger.error(error);
    }
};              