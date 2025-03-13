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
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import passport from "passport";
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

// Session setup
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth2.0 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "YOUR_GOOGLE_CLIENT_ID",
      clientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
      callbackURL: "http://localhost:3000/auth/google/callback",
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

app.use(express.static(path.join(__dirname, "../../BrokeChain/dist")));

app.use("/ai", aiRoute);
app.use("/auth", authRoute);

app.get("/test", (_, res) => {
  res.send("test");
});

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
