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
const User_1 = require("../models/User");
const Orders_1 = require("../models/Orders");
const newToken_1 = __importDefault(require("../controllers/newToken"));
const createStandardResponse = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findOne({ email });
    const userObject = user === null || user === void 0 ? void 0 : user.toJSON();
    if (!user)
        throw new Error("User not found!");
    const orders = yield Orders_1.Order.find({ user_id: user._id });
    //neues token und altes speichern
    const updatedToken = yield (0, newToken_1.default)(token, email);
    return Object.assign(Object.assign({}, userObject), { token: updatedToken, orders });
});
exports.default = createStandardResponse;
