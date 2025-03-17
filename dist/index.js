"use strict";
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
const aiRouter_1 = __importDefault(require("./routes/aiRouter"));
const dailyStore_1 = require("./libs/dailyStore");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// serverUpkeeper();
(0, database_1.connectDB)();
(0, dailyStore_1.dailyStore)();
const app = (0, express_1.default)();
const MY_SECRET_KEY = process.env.MY_SECRET_KEY || "";
// Neue Middleware, um den COOP-Header zu setzen
// app.use((req, res, next) => {
//   res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
//   next();
// });
// Session setup
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
// // Passport Google OAuth2.0 Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID!, // Muss in .env korrekt gesetzt sein
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // Muss in .env korrekt gesetzt sein
//       // Vollständige URL verwenden und genau so registrieren:
//       callbackURL:
//         process.env.GOOGLE_CALLBACK_URL ||
//         "https://broke.dev-space.vip/auth/google/callback",
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Here you can handle user profile data (e.g., save to database)
//       return done(null, profile);
//     }
//   )
// );
// // Serialize and deserialize user
// passport.serializeUser((user, done) => {
//   done(null, user);
// });
// passport.deserializeUser((user: any, done) => {
//   done(null, user as Express.User);
// });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT;
// Neue Google-Auth-Route
// Registrieren Sie zuerst alle API‑Routen
app.use("/auth", authRouter_1.default); // Auth-Routen zuerst einbinden
app.use("/ai", aiRouter_1.default);
app.use("/marketData", marketRouter_1.default);
app.use("/trade", tradeRouter_1.default);
app.use("/user", userRouter_1.default);
// Danach statische Dateien bereitstellen:
app.use(express_1.default.static(path_1.default.join(__dirname, "../../BrokeChain/dist")));
// app.use(passport.initialize());
// Route zum Starten des OAuth-Flows
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );
// Catch-all‑Route als letztes
app.use("*", (req, res, next) => {
    console.log("Fallback Route aufgerufen für", req.method, req.originalUrl);
    res.sendFile(path_1.default.join(__dirname, "../../BrokeChain/dist", "index.html"));
});
app.use((err, req, res, next) => {
    res.status(400).send(err.message);
});
app.listen(PORT, () => console.log(`Server listens at Port: ${PORT}`));
