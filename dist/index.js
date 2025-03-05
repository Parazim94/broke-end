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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./libs/database");
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const marketRouter_1 = __importDefault(require("./routes/marketRouter"));
const tradeRouter_1 = __importDefault(require("./routes/tradeRouter"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const dailyStore_1 = require("./libs/dailyStore");
dotenv_1.default.config();
(0, database_1.connectDB)();
const app = (0, express_1.default)();
(0, dailyStore_1.dailyStore)();
app.use((0, cors_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT;
app.use("/auth", authRouter_1.default);
app.use("/marketData", marketRouter_1.default);
app.use("/trade", tradeRouter_1.default);
app.use("/user", userRouter_1.default);
app.use("/api/cron", (req, res, send) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, dailyStore_1.runAtMidnight)();
    res.status(202).json({ message: "daily fetch" });
}));
app.use("*", (req, res, next) => {
    res.status(404).send("Oioioi,site not found!");
});
app.use((err, req, res, next) => {
    console.log("error", err.message);
    res.status(400).send(err.message);
});
app.listen(PORT, () => console.log(`Server listens at Port: ${PORT}`));
