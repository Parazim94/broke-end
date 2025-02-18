"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./libs/database");
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const marketRouter_1 = __importDefault(require("./routes/marketRouter"));
dotenv_1.default.config();
(0, database_1.connectDB)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "http://localhost:8081", credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const PORT = process.env.PORT;
app.use("/auth", authRouter_1.default);
app.use("/marketData", marketRouter_1.default);
app.use("*", (req, res, next) => {
    res.send("Oi,site not found!");
});
app.use((err, req, res, next) => {
    console.log("error", err.message);
    res.status(400).send(err.message);
});
app.listen(PORT, () => console.log(`Server listens at Port: ${PORT}`));
