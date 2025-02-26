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
    let timeUntilMidnight = midnight.getTime() - now.getTime(); // Time in milliseconds until midnight
    timeUntilMidnight = 5000;
    // Set a timeout to run the task at midnight
    setTimeout(() => {
        runAtMidnight(); // Execute the task
        dailyStore(); // Schedule the task again for the next day
    }, timeUntilMidnight);
}
function runAtMidnight() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield User_1.User.find();
        // Process each user one at a time
        for (const user of users) {
            let total = user.cash;
            const positions = Object.keys(user.positions);
            // Process each position one at a time
            for (const key of positions) {
                const binanceSymbol = key.toUpperCase() + "USDT";
                const response = yield fetch(`https://api.binance.us/api/v3/ticker/price?symbol=${binanceSymbol}`);
                if (!response.ok)
                    throw new Error("Fehler beim taeglichen price-fetching");
                const data = yield response.json();
                // console.log(user.email, data);
                total += data.price * user.positions[key];
                // console.log(user.email, key, user.positions[key], data.price, total);
            }
            const date = Date.now();
            // console.log("total:");
            console.log(user.email, total);
            // user.history.push({ total, date });
            // await user.save();
        }
    });
}
