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
exports.checkToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const DeletedToken_1 = require("../models/DeletedToken");
const checkToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.params.token;
    const deletedToken = yield DeletedToken_1.DeletedToken.findOne({ token: token });
    if (deletedToken === null || deletedToken === void 0 ? void 0 : deletedToken.token)
        return next(new Error("is logged out!"));
    if (!token) {
        return next(new Error("no token!"));
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return next(new Error("JWT secret is not defined"));
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        if (typeof payload !== "string" && "email" in payload) {
            const user = yield User_1.User.findOne({ email: payload.email });
            req.user = user === null || user === void 0 ? void 0 : user.toJSON();
            if (!user)
                throw new Error("user not found");
            next();
        }
        else {
            return next(new Error("Invalid token payload"));
        }
    }
    catch (err) {
        return next(new Error("Token verification failed"));
    }
});
exports.checkToken = checkToken;
