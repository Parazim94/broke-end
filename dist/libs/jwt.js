"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createJwt = (email) => {
    const secret = process.env.JWT_SECRET;
    if (!secret || !email) {
        throw new Error("No JWT_SECRET or no email!");
    }
    const token = jsonwebtoken_1.default.sign({ email: email }, secret, {
        expiresIn: "8h",
    });
    console.log(token);
    return token;
};
exports.createJwt = createJwt;
