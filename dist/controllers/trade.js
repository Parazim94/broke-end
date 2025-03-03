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
exports.storeTrade = storeTrade;
const User_1 = require("../models/User");
const trade = (symbol, binanceSymbol, value, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (binanceSymbol) {
        const response = yield fetch(`https://api.binance.us/api/v3/ticker/price?symbol=${binanceSymbol}`);
        if (!response.ok)
            throw new Error(`kein fetch!: ${response.status} ${response.statusText}`);
        const data = yield response.json();
        const price = yield data.price;
        if (!price)
            throw new Error(`preis stimmt nicht: ${price}   Bsymbol${binanceSymbol} symbol ${symbol} data:${data.symbol}, ${data.price}`);
        if (value === 0)
            throw new Error("sehr witzig...");
        if (value > 0) {
            if (value * price > user.cash)
                throw new Error("not enough cash!");
            user.cash -= value * price;
            if (!user.positions[symbol]) {
                user.positions[symbol] = 0;
            }
            user.positions[symbol] += value;
        }
        if (value < 0) {
            if (-value > user.positions[symbol] || !user.positions[symbol]) {
                throw new Error(`not enough ${symbol}`);
            }
            const dCash = value * price;
            user.cash = user.cash - dCash;
            user.positions[symbol] += value;
        }
        if (user.positions[symbol] === 0)
            delete user.positions[symbol];
        yield User_1.User.updateOne({ _id: user._id }, user);
        storeTrade(symbol, price, value, false, user.email);
        return user;
    }
});
exports.default = trade;
function storeTrade(symbol, price, amount, order, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User_1.User.findOne({ email: email });
        const trades = user === null || user === void 0 ? void 0 : user.tradeHistory;
        trades === null || trades === void 0 ? void 0 : trades.push({ symbol, price, amount, order });
        // await User.updateOne({ email: email }, { tradeHistory: trades });
        yield (user === null || user === void 0 ? void 0 : user.updateOne({ tradeHistory: trades }));
    });
}
