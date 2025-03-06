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
const User_1 = require("../models/User");
const DeletedToken_1 = require("../models/DeletedToken");
const crypto_1 = require("../libs/crypto");
const jwt_1 = require("../libs/jwt");
const checkToken_1 = require("../middleware/checkToken");
const sendVerificationEmail_1 = __importDefault(require("../libs/sendVerificationEmail"));
const router = express_1.default.Router();
router.post("/register", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userName, email, password, age } = req.body;
        const hashedPassword = yield (0, crypto_1.hash)(password);
        const newUser = yield User_1.User.create({
            userName,
            email,
            age,
            hashedPW: hashedPassword,
        });
        (0, sendVerificationEmail_1.default)(email);
        res.send(newUser);
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
router.post("/login", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_1.User.findOne({ email: email });
        if (user && user.hashedPW && (yield (0, crypto_1.compare)(password, user.hashedPW))) {
            const jwt = (0, jwt_1.createJwt)(user.email);
            const userObject = user.toObject();
            res.status(200).send(Object.assign(Object.assign({}, userObject), { token: jwt }));
        }
        else {
            throw new Error("Login Fehler");
        }
    }
    catch (error) {
        next(error);
    }
}));
router.get("/logout", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token;
    let message;
    if (token) {
        const deletedToken = yield DeletedToken_1.DeletedToken.create({ token: token });
        message = "User logged out!";
    }
    else
        message = "No user to log out!";
    res.send(message);
}));
router.get("/verify/:token", checkToken_1.checkToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield User_1.User.updateOne({ email: req.user.email }, { isVerified: true });
        const user = yield User_1.User.findOne({ email: req.user.email });
        if (user) {
            res.send(`<b style="font-size:25px;">BROKECHAIN : ${user.email} from ${user.userName} is verfied! You can login now!</b>`);
        }
    }
    catch (error) {
        next(error);
    }
}));
router.post("/verificationemail", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        if (yield User_1.User.findOne({ email: email })) {
            (0, sendVerificationEmail_1.default)(email);
            res.send("Verification mail send.");
        }
        else {
            throw new Error("No user with the email found");
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
