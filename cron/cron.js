import { runAtMidnight } from "../libs/dailyStore";

export default function handler(req, res) {
  runAtMidnight();
  res.status(200).end("Hello Cron!");
}
