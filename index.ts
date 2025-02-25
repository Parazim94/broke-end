import express from "express";
import cors from "cors";
// import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./libs/database";
import authRoute from "./routes/authRouter";
import marketRoute from "./routes/marketRouter";
import tradeRoute from "./routes/tradeRouter";
import settingsRoute from "./routes/settingsRouter";
interface Error {
  message: string;
}
interface Request extends express.Request {}
interface Response extends express.Response {}
interface NextFunction extends express.NextFunction {}

dotenv.config();
connectDB();
const app = express();

app.use(cors());

app.use(cors());
app.use(express.json());
// app.use(cookieParser());

const PORT = process.env.PORT;

app.use("/auth", authRoute);

app.use("/marketData", marketRoute);

app.use("/trade", tradeRoute);

app.use("/settings", settingsRoute);
app.use("*", (req, res, next) => {
  res.send("Oioioi,site not found!");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log("error", err.message);
  res.status(400).send(err.message);
});

app.listen(PORT, () => console.log(`Server listens at Port: ${PORT}`));
