"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const ordersSchema = new mongoose_1.Schema({
    symbol: { type: String, required: true },
    amount: { type: Number, required: true },
    threshold: { type: Number, required: true },
    user_id: { type: String, required: true },
});
exports.Order = (0, mongoose_1.model)("Order", ordersSchema);
