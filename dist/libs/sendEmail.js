"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { AUTH_EMAIL, AUTH_PASS } = process.env;
console.log(AUTH_EMAIL, AUTH_PASS);
const transporter = nodemailer_1.default.createTransport({
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
const sendEmail = () => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: AUTH_EMAIL,
        to: "jbantin@gmx.de",
        subject: "BrokeChain Link to verify email",
        html: `<p>Please verify this email for your BrokeChain Account</p><p style="color:tomato;font-size:25px;"><b>LINK</b></p><p>This code <b>expires in 30 minutes</b></p>`,
    };
    console.log("huhu try to send email.");
    try {
        yield transporter.sendMail(mailOptions);
        return;
    }
    catch (error) {
        throw error;
    }
});
exports.default = sendEmail;
