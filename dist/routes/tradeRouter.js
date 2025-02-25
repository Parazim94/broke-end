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
const trade_1 = __importDefault(require("../controllers/trade"));
const router = express_1.default.Router();
router.post("/", checkToken_1.checkToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol, value } = req.body;
        const binanceSymbol = symbol.toUpperCase() + "USDT";
        const user = req.user;
        const UserAfterTrade = yield (0, trade_1.default)(binanceSymbol, value, user);
        // if (binanceSymbol) {
        //   const response = await fetch(
        //     `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`
        //   );
        //   const data = await response.json();
        //   const price = data.price;
        //   if (value === 0) throw new Error("sehr witzig...");
        //   if (value > 0) {
        //     if (value * price > user.cash) throw new Error("not enough cash!");
        //     user.cash -= value * price;
        //     if (!user.positions[binanceSymbol]) {
        //       user.positions[binanceSymbol] = 0;
        //     }
        //     user.positions[binanceSymbol] += value;
        //   }
        //   if (value < 0) {
        //     if (
        //       -value > user.positions[binanceSymbol] ||
        //       !user.positions[binanceSymbol]
        //     ) {
        //       throw new Error(`not enough ${symbol}`);
        //     }
        //     user.cash -= value * price;
        //     user.positions[binanceSymbol] += value;
        //   }
        //   console.log(user.cash);
        //   await User.updateOne({ _id: user._id }, user);
        //   res.send(user);
        res.send(UserAfterTrade);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
