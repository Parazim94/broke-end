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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkToken_1 = require("../middleware/checkToken");
const User_1 = require("../models/User");
const Orders_1 = require("../models/Orders");
const router = express_1.default.Router();
router.post("/settings", checkToken_1.checkToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //loeschen,damit das nicht geaendert wird
        delete req.body.cash;
        delete req.body.positions;
        delete req.body.history;
        delete req.body.isVerified;
        yield User_1.User.updateOne({ email: req.user.email }, req.body);
        const user = yield User_1.User.findOne({ email: req.user.email });
        const token = req.user.token;
        const userObject = user === null || user === void 0 ? void 0 : user.toObject();
        const newUser = Object.assign(Object.assign({}, userObject), { token });
        res.send(newUser);
    }
    catch (error) {
        console.error("Fehler beim updaten!", error);
    }
}));
router.post("/", checkToken_1.checkToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield Orders_1.Order.find({ user_id: req.user._id });
        res.send(Object.assign(Object.assign({}, req.user), { orders }));
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
