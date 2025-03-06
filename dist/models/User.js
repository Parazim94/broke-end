"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const tradeHistorySchema = new mongoose_1.Schema({
    symbol: { type: String, required: true },
    price: { type: Number, required: true },
    amount: { type: Number, required: true },
    order: { type: Boolean, default: false },
    date: { type: Date },
});
const historySchema = new mongoose_1.Schema({
    total: Number,
    date: Date,
}, { _id: false } // Disable _id for history subdocuments
);
const userSchema = new mongoose_1.Schema({
    userName: String,
    email: { type: String, required: true, unique: true },
    oldEmail: { type: String },
    password: { type: String, require: true },
    age: { type: Number, required: true },
    isVerified: { type: Boolean, default: false },
    hashedPW: { type: String, required: true },
    cash: { type: Number, default: 10000 },
    history: [historySchema], //trade.id
    positions: { type: Object, default: {} }, //symbol,value
    favorites: [String],
    prefTheme: [String],
    tradeHistory: [tradeHistorySchema],
}, { timestamps: true });
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.hashedPW;
    delete obj.__v;
    obj.tradeHistory = obj.tradeHistory.slice(-10);
    return obj;
};
exports.User = (0, mongoose_1.model)("User", userSchema);
