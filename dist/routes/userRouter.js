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
const sendVerificationEmail_1 = __importDefault(require("../libs/sendVerificationEmail"));
const crypto_1 = require("../libs/crypto");
const createStandardResponse_1 = __importDefault(require("../libs/createStandardResponse"));
const router = express_1.default.Router();
router.put("/settings", checkToken_1.checkToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //loeschen,damit das nicht geaendert wird
        delete req.body.cash;
        delete req.body.positions;
        delete req.body.history;
        delete req.body.isVerified;
        delete req.body.tradeHistory;
        yield User_1.User.updateOne({ email: req.user.email }, req.body);
        res.send(yield (0, createStandardResponse_1.default)(req.user.email, req.body.token));
    }
    catch (error) {
        console.error("Fehler beim updaten!", error);
        next(error);
    }
}));
router.post("/", checkToken_1.checkToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json(yield (0, createStandardResponse_1.default)(req.user.email, req.body.token));
    }
    catch (error) {
        next(error);
    }
}));
router.put("/change_password", checkToken_1.checkToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body.newPassword && req.body.password) {
            const user = yield User_1.User.findOne({ email: req.user.email });
            if (user && (yield (0, crypto_1.compare)(req.body.password, user.hashedPW))) {
                const hashedPW = yield (0, crypto_1.hash)(req.body.newPassword);
                yield User_1.User.updateOne({ email: req.user.email }, { hashedPW });
                res.json(yield (0, createStandardResponse_1.default)(req.user.email, req.body.token));
            }
            else {
                throw new Error("wrong old password or user not found!");
            }
        }
        else {
            throw new Error("wrong credentials!");
        }
    }
    catch (error) {
        next(error);
    }
}));
router.put("/change_email", checkToken_1.checkToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newEmail = req.body.newEmail;
        if (!newEmail) {
            throw new Error("no new email provided.");
        }
        yield User_1.User.updateOne({ email: req.user.email }, { email: newEmail, oldEmail: req.user.email, isVerified: false });
        const updatedUser = yield User_1.User.findOne({ email: newEmail });
        (0, sendVerificationEmail_1.default)(newEmail);
        res.json(yield (0, createStandardResponse_1.default)(newEmail, req.body.token));
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
