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
const passport_google_oauth20_1 = require("passport-google-oauth20");
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
dotenv_1.default.config();
// serverUpkeeper();
(0, database_1.connectDB)();
(0, dailyStore_1.dailyStore)();
const app = (0, express_1.default)();
const MY_SECRET_KEY = process.env.MY_SECRET_KEY || "";
// Session setup
app.use((0, express_session_1.default)({
    secret: MY_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
}));
// Passport initialization
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
// Passport Google OAuth2.0 Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    // Here you can handle user profile data (e.g., save to database)
    return done(null, profile);
}));
// Serialize and deserialize user
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    done(null, user);
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.get("/auth/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    // Successful authentication, redirect to React app
    res.redirect("http://localhost:3000");
});
app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Error during logout:", err);
            return res.status(500).send("Logout failed");
        }
        res.redirect("http://localhost:3000");
    });
});
app.get("/user", (req, res) => {
    res.send(req.user);
});
const PORT = process.env.PORT;
app.use(express_1.default.static(path_1.default.join(__dirname, "../../BrokeChain/dist")));
app.use("/ai", aiRouter_1.default);
app.use("/auth", authRouter_1.default);
app.use("/marketData", marketRouter_1.default);
app.use("/trade", tradeRouter_1.default);
app.use("/user", userRouter_1.default);
// app.use("/api/cron", async (req, res, send) => {
//   await runAtMidnight();
//   res.status(202).json({ message: "daily fetch" });
// });
// Für alle unbekannten Routen liefere die index.html
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../../BrokeChain/dist"));
// });
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });
app.use("*", (req, res, next) => {
    res.sendFile(path_1.default.join(__dirname, "../../BrokeChain/dist", "index.html"));
});
app.use((err, req, res, next) => {
    res.status(400).send(err.message);
});
app.listen(PORT, () => console.log(`Server listens at Port: ${PORT}`));
