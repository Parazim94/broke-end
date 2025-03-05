import express from "express";
import cors from "cors";

import dotenv from "dotenv";
import { connectDB } from "./libs/database";
import authRoute from "./routes/authRouter";
import marketRoute from "./routes/marketRouter";
import tradeRoute from "./routes/tradeRouter";
import userRoute from "./routes/userRouter";
import { dailyStore, runAtMidnight } from "./libs/dailyStore";

interface Error {
  message: string;
}
interface Request extends express.Request {}
interface Response extends express.Response {}
interface NextFunction extends express.NextFunction {}

dotenv.config();
connectDB();
const app = express();

dailyStore();

app.use(cors());

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

app.use("/auth", authRoute);

app.use("/marketData", marketRoute);

app.use("/trade", tradeRoute);

app.use("/user", userRoute);

app.use("/api/cron", async (req, res, send) => {
  await runAtMidnight();
  res.status(202).json({ message: "daily fetch" });
});

app.use("*", (req, res, next) => {
  res.status(404).send("Oioioi,site not found!");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log("error", err.message);
  res.status(400).send(err.message);
});

app.listen(PORT, () => console.log(`Server listens at Port: ${PORT}`));
