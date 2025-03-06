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
exports.manageOrders = void 0;
const User_1 = require("../models/User");
const Orders_1 = require("../models/Orders");
const trade_1 = require("../controllers/trade");
const manageOrders = (binanceCache) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const orders = yield Orders_1.Order.find();
    for (const order of orders) {
        const user = yield User_1.User.findOne({ _id: order.user_id });
        const key = order.symbol;
        const coin = binanceCache.find((coin) => coin.symbol === `${key.toUpperCase()}USDT`);
        //kaufen?
        if (order.amount > 0) {
            //es geht ums kaufen kaufen!
            if (coin.lastPrice <= order.threshold) {
                const orderPrice = coin.lastPrice * order.amount;
                if (((_a = user === null || user === void 0 ? void 0 : user.cash) !== null && _a !== void 0 ? _a : 0) >= orderPrice) {
                    if (user && user.positions) {
                        user.positions[key] = (user.positions[key] || 0) + order.amount;
                        user.cash -= orderPrice;
                        const newUser = yield User_1.User.updateOne({ _id: user._id }, user);
                        yield Orders_1.Order.deleteOne({ _id: order._id });
                        (0, trade_1.storeTrade)(coin.symbol.substring(0, coin.symbol.length - 4).toLowerCase(), coin.lastPrice, order.amount, true, user.email);
                    }
                }
            }
        }
        else {
            //verkaufen
            if (coin.lastPrice >= order.threshold) {
                const orderPrice = coin.lastPrice * order.amount;
                if ((user === null || user === void 0 ? void 0 : user.positions[key]) >= order.amount) {
                    if (user && user.positions) {
                        user.positions[key] = (user.positions[key] || 0) + order.amount;
                        user.cash -= orderPrice;
                        const newUser = yield User_1.User.updateOne({ _id: user._id }, user);
                        yield Orders_1.Order.deleteOne({ _id: order._id });
                        (0, trade_1.storeTrade)(coin.symbol, coin.lastPrice, order.amount, true, user.email);
                    }
                }
            }
        }
    }
});
exports.manageOrders = manageOrders;
