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
const router = express_1.default.Router();
router.post("/", checkToken_1.checkToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("updateOne falsch");
        //loeschen,damit das nicht geaendert wird
        delete req.body.cash;
        delete req.body.positions;
        delete req.body.history;
        delete req.body.isVerified;
        yield User_1.User.updateOne({ email: req.user.email }, req.body);
        const user = yield User_1.User.findOne({ email: req.user.email });
        res.send(user);
    }
    catch (error) {
        console.error("Fehler beim updaten!", error);
    }
}));
exports.default = router;
