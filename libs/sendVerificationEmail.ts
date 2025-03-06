import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createJwt } from "./jwt";

dotenv.config();
const { AUTH_EMAIL, AUTH_PASS, AUTH_URL } = process.env;
console.log(AUTH_EMAIL, AUTH_PASS, AUTH_URL);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASS,
  },
});

// transporter.verify((error, success) => {
//   if (error) {
//     console.error("Connection test failed", error);
//   } else {
//     console.log("Connection test successful! Ready to send emails.");
//   }
// });

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
