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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmail = void 0;
const User_1 = require("../models/User");
const checkEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.User.findOne({ email: req.user.email });
        if (!user) {
            throw new Error("user not found in checkEmail!!");
        }
        else {
            if (!user.isVerified) {
                throw new Error("Email not verified!");
            }
            else
                next();
        }
    }
    catch (error) {
        next(error);
    }
});
exports.checkEmail = checkEmail;
