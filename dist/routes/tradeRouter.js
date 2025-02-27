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
const Orders_1 = require("../models/Orders");
const trade_1 = __importDefault(require("../controllers/trade"));
const router = express_1.default.Router();
router.post("/", checkToken_1.checkToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol, value } = req.body;
        const binanceSymbol = symbol.toUpperCase() + "USDT";
        const user = req.user;
        const UserAfterTrade = yield (0, trade_1.default)(symbol, binanceSymbol, value, user);
        res.send(UserAfterTrade);
    }
    catch (error) {
        next(error);
    }
}));
router.post("/order", checkToken_1.checkToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { symbol, amount, threshold } = req.body;
    try {
        const { symbol, amount, threshold } = req.body;
        if (!symbol || !amount || !threshold)
            throw new Error("wrong data to order");
        const newOrder = yield Orders_1.Order.create({
            symbol,
            amount,
            threshold,
            user_id: req.user._id,
        });
        res.send(newOrder);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
