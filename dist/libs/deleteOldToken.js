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
exports.deleteOldToken = void 0;
const DeletedToken_1 = require("../models/DeletedToken");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const deleteOldToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const tokenArray = yield DeletedToken_1.DeletedToken.find();
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    for (const token of tokenArray) {
        const oldToken = token.token;
        try {
            const payload = jsonwebtoken_1.default.verify(oldToken, secret);
            if (typeof payload !== "string" && "email" in payload) {
                console.log("nicht loeschen bitte");
            }
            else {
                console.log(`loeschen : ${token.token}`);
            }
        }
        catch (error) {
            console.log(`loeschen : ${oldToken}`);
            yield DeletedToken_1.DeletedToken.deleteOne({ token: oldToken });
        }
    }
});
exports.deleteOldToken = deleteOldToken;
