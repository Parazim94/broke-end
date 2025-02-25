"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    userName: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, require: true },
    age: { type: Number, required: true },
    isVerified: { type: Boolean, default: false },
    hashedPW: { type: String, required: true },
    cash: { type: Number, default: 10000 },
    history: [Number], //trade.id
    positions: { type: Object, default: { BTCUSDT: 0 } }, //coin.id amount
    favorites: [String],
    prefTheme: [String],
    token: { type: String },
}, { timestamps: true });
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.hashedPW;
    delete obj.__v;
    return obj;
};
exports.User = (0, mongoose_1.model)("User", userSchema);
