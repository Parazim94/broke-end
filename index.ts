import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./libs/database";
import authRoute from "./routes/authRouter";
import marketRoute from "./routes/marketRouter";
import tradeRoute from "./routes/tradeRouter";
import userRoute from "./routes/userRouter";
import aiRoute from "./routes/aiRouter";
import { dailyStore, runAtMidnight } from "./libs/dailyStore";
import path from "path";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Debug-Ausgaben (nur zu Testzwecken – keine sensitiven Daten ausgeben)
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID ? "geladen" : "NICHT geladen");
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET ? "geladen" : "NICHT geladen");
console.log("Google Callback URL:", process.env.GOOGLE_CALLBACK_URL || "Fallback-URL verwendet");

// import serverUpkeeper from "./libs/serverUpkeeper";

interface Error {
  message: string;
}
interface Request extends express.Request {}
interface Response extends express.Response {}
interface NextFunction extends express.NextFunction {}

dotenv.config();
// serverUpkeeper();
connectDB();
dailyStore();

const app = express();
const MY_SECRET_KEY = process.env.MY_SECRET_KEY || "";

// Neue Middleware, um den COOP-Header zu setzen
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// Session setup

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

// Passport Google OAuth2.0 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!, // Muss in .env korrekt gesetzt sein
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // Muss in .env korrekt gesetzt sein
      // Vollständige URL verwenden und genau so registrieren:
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://broke.dev-space.vip/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Here you can handle user profile data (e.g., save to database)
      return done(null, profile);
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user as Express.User);
});

app.use(cors());

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

// Neue Google-Auth-Route

app.use(express.static(path.join(__dirname, "../../BrokeChain/dist")));

app.use("/ai", aiRoute);
app.use("/auth", authRoute);

app.use("/marketData", marketRoute);

app.use("/trade", tradeRoute);

app.use("/user", userRoute);

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
  res.sendFile(path.join(__dirname, "../../BrokeChain/dist", "index.html"));
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(400).send(err.message);
});

app.listen(PORT, () => console.log(`Server listens at Port: ${PORT}`));
