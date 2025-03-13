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
const app = express();

dailyStore();

// sendVerificationEmail("jbantin@gmx.de");

app.use(cors());

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

app.use(express.static(path.join(__dirname, "../../BrokeChain/dist")));

app.use("/ai", aiRoute);
app.use("/auth", authRoute);

app.use("/marketData", marketRoute);

app.use("/trade", tradeRoute);

app.use("/user", userRoute);

app.use("/api/cron", async (req, res, send) => {
  await runAtMidnight();
  res.status(202).json({ message: "daily fetch" });
});

// Für alle unbekannten Routen liefere die index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../BrokeChain/dist"));
});

app.use("*", (req, res, next) => {
  res.send("oioioi,not found");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(400).send(err.message);
});

app.listen(PORT, () => console.log(`Server listens at Port: ${PORT}`));
