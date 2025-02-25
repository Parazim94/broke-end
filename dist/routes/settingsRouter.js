"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkToken_1 = require("../middleware/checkToken");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post("/", checkToken_1.checkToken, (req, res, next) => {
    try {
        const user = User_1.User.updateOne({ email: req.user.email }, req.body);
        res.send(user);
    }
    catch (error) {
        console.error("Fehler beim updaten!", error);
    }
});
exports.default = router;
