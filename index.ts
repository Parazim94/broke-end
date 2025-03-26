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
import { hourlyStore } from "./libs/hourlyStore";
import intervalFetchData from "./libs/intervalFetchData";
import path from "path";

interface Error {
  message: string;
}
interface Request extends express.Request {}
interface Response extends express.Response {}
interface NextFunction extends express.NextFunction {}

dotenv.config();

connectDB();
hourlyStore();
// dailyStore();
intervalFetchData();

const app = express();
app.use(cors());

app.use(express.json());

const PORT = process.env.PORT;

app.use("/auth", authRoute);
app.use("/ai", aiRoute);
app.use("/marketData", marketRoute);
app.use("/trade", tradeRoute);
app.use("/user", userRoute);

// Danach statische Dateien bereitstellen:
app.use(express.static(path.join(__dirname, "../../BrokeChain/dist")));

app.use("*", (req, res, next) => {
  console.log("Fallback Route aufgerufen für", req.method, req.originalUrl);
  res.sendFile(path.join(__dirname, "../../BrokeChain/dist", "index.html"));
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(400).send(err.message);
});

app.listen(PORT, () => console.log(`Server listens at Port: ${PORT}`));
