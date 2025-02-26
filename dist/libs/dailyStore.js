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
exports.dailyStore = dailyStore;
const User_1 = require("../models/User");
function dailyStore() {
    const now = new Date();
    console.log(now);
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Set to next midnight
    console.log(midnight);
    let timeUntilMidnight = midnight.getTime() - now.getTime(); // Time in milliseconds until midnight
    console.log(timeUntilMidnight);
    timeUntilMidnight = 3600000;
    // Set a timeout to run the task at midnight
    setTimeout(() => {
        runAtMidnight(); // Execute the task
        dailyStore(); // Schedule the task again for the next day
    }, timeUntilMidnight);
}
function runAtMidnight() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield User_1.User.find();
        users.forEach((user) => __awaiter(this, void 0, void 0, function* () {
            let total = user.cash;
            yield Object.keys(user.positions).forEach((key) => __awaiter(this, void 0, void 0, function* () {
                const binanceSymbol = key.toUpperCase() + "USDT";
                try {
                    const response = yield fetch(`https://api.binance.us/api/v3/ticker/price?symbol=${binanceSymbol}`);
                    if (!response.ok)
                        throw new Error("Fehler beim taeglichen price-fetching");
                    const price = yield response.json();
                    total += price * user.positions[key];
                }
                catch (error) { }
            }));
            const date = Date.now();
            user.history.push({ total, date });
            yield user.save();
            console.log(user.history);
        }));
    });
}
