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
const express_1 = __importDefault(require("express"));
const checkToken_1 = require("../middleware/checkToken");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post("/", checkToken_1.checkToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol, value } = req.body;
        const binanceSymbol = symbol.toUpperCase() + "USDT";
        const user = req.user;
        console.log("huhu", user.positions);
        if (req.user.positions[binanceSymbol])
            console.log(req.user.positions[binanceSymbol]);
        if (binanceSymbol) {
            const response = yield fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`);
            const data = yield response.json();
            const price = data.price;
            if (value === 0)
                throw new Error("sehr witzig...");
            if (value > 0) {
                if (value * price > user.cash)
                    throw new Error("not enough cash!");
                user.cash -= value * price;
                if (!user.positions[binanceSymbol]) {
                    user.positions[binanceSymbol] = 0;
                }
                user.positions[binanceSymbol] += value;
            }
            if (value < 0) {
                if (-value > user.positions[binanceSymbol] ||
                    !user.positions[binanceSymbol]) {
                    throw new Error(`not enough ${symbol}`);
                }
                user.cash -= value * price;
                user.positions[binanceSymbol] += value;
            }
            console.log(user.cash);
            yield User_1.User.updateOne({ _id: user._id }, user);
            res.send(user);
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
