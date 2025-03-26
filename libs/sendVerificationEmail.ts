import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createJwt } from "./jwt";

dotenv.config();
const { AUTH_EMAIL, AUTH_PASS, AUTH_URL } = process.env;
if (!AUTH_EMAIL || !AUTH_PASS || !AUTH_URL) {
  throw new Error("Missing email configuration in environment variables.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASS,
  },
});

const sendVerificationEmail = async (email: string) => {
  const jwt = createJwt(email);
  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "BrokeChain Link to verify email",
    html: `<p>Please verify this email for your BrokeChain Account</p><p style="color:tomato;font-size:25px;"><a href=${AUTH_URL}${jwt}><b>LINK</b></a></p><p>This code <b>expires in 30 minutes</b></p>`,
  };
  try {
    await transporter.sendMail(mailOptions);
    return;
  } catch (error) {
    throw error;
  }
};

export default sendVerificationEmail;

export const sendNewPassword = async (
  email: string,
  newPassword: string,
  message: string = "<p>New password for your BrokeChain Account</p><p>You can ignore this if you didn't request a new password!</p>"
) => {
  const mailOptions = {
    html: `${message}<p style="color:tomato;font-size:20px;">${newPassword}</p>`,
    to: email,
    subject: "BrokeChain new Password",
  };
  try {
    await transporter.sendMail(mailOptions);
    return;
  } catch (error) {
    throw error;
  }
};
