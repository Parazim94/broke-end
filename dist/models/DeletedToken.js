"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletedToken = void 0;
const mongoose_1 = require("mongoose");
const deletedTokenSchema = new mongoose_1.Schema({
    token: String,
});
exports.DeletedToken = (0, mongoose_1.model)("old token", deletedTokenSchema);
