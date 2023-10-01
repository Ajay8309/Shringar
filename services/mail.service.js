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
                        from: "ShringarJewellers@gmail.com",
                        to,
                        subject: "Welcome to Shringar Jewellers",
                        html: `
                        <p style="text-align: center;"><strong><span style="font-size: 17px;">Thank you for joining us 😃</span></strong></p>
                        <p style='box-sizing: inherit; margin: 0px 0px 26px; padding: 0px; border: 0px; font-size: 19px !important; vertical-align: baseline; background: transparent; text-size-adjust: none; font-weight: 300 !important; line-height: 30px !important; color: rgb(12, 15, 51); font-family: "IBM Plex Sans", sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;'>Dear ${name},</p>
                        <p style='box-sizing: inherit; margin: 0px 0px 26px; padding: 0px; border: 0px; font-size: 19px !important; vertical-align: baseline; background: transparent; text-size-adjust: none; font-weight: 300 !important; line-height: 30px !important; color: rgb(12, 15, 51); font-family: "IBM Plex Sans", sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;'>Thank you for registering on PERN store. We are glad to have you as a customer.</p>
                        <p style='box-sizing: inherit; margin: 0px 0px 26px; padding: 0px; border: 0px; font-size: 19px !important; vertical-align: baseline; background: transparent; text-size-adjust: none; font-weight: 300 !important; line-height: 30px !important; color: rgb(12, 15, 51); font-family: "IBM Plex Sans", sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;'>We welcome you to enjoy your freedom to shop anywhere, anytime.</p>
                        <p style='box-sizing: inherit; margin: 0px 0px 26px; padding: 0px; border: 0px; vertical-align: baseline; background: transparent; text-size-adjust: none; color: rgb(12, 15, 51); font-family: "IBM Plex Sans", sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-size: 19px !important; font-weight: 300 !important; line-height: 30px !important;'><a href="${url}">Continue shopping</a></p>
                        <p style='box-sizing: inherit; margin: 0px 0px 26px; padding: 0px; border: 0px; font-size: 19px !important; vertical-align: baseline; background: transparent; text-size-adjust: none; font-weight: 300 !important; line-height: 30px !important; color: rgb(12, 15, 51); font-family: "IBM Plex Sans", sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;'><br></p>
                        `,
                    };
            
                    await transporter.sendMail(message);
                } catch (error) {
                    logger.error(error);
                }
            };
            

            const forgotPasswordMail = async (token, email) => {
                try {
                    const message = {
                        to: email,
                        subject: "Forgot Password",
                        html: `
                        <p>To reset your password, please click the link below.
                        <a href="${url}/reset-password?token=${encodeURIComponent(token)}&email=${email}">
                        <br/>
                        Reset Password
                        </a>
                        </p>
                        <b>Note that this link will expire in the next 1 hour.</b>
                        `,
                    };
                    const res = await transporter.sendMail(message);
                    return res;
                } catch (error) {
                    logger.error(error);
                    throw new ErrorHandler(500, error.message);
                }
            };
            

const resetPasswordMail = async (email) => {
    try {
        const message = {
            from : process.env.SMTP_FROM,
            to : email,
            subject :"Password reset seccessful:",
            html:`<p>Your Password has been changed successfully:</p>`,
        };
        const res = transporter.sendMail(message);
    } catch (error) {
        logger.error(error);
        throw new ErrorHandler(500, error.message);
    }
};

module.exports = {
    signupMail,
    resetPasswordMail,
    forgotPasswordMail,
}