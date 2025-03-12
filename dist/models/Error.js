"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Error = void 0;
const mongoose_1 = require("mongoose");
const errorSchema = new mongoose_1.Schema({
    date: Date,
    error: String,
});
exports.Error = (0, mongoose_1.model)("error", errorSchema);
