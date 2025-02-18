"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OldToken = void 0;
const mongoose_1 = require("mongoose");
const oldTokenSchema = new mongoose_1.Schema({
    token: String,
});
exports.OldToken = (0, mongoose_1.model)("old token", oldTokenSchema);
