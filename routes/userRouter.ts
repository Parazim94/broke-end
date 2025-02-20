import express from "express";
import { checkToken } from "../middleware/checkToken";
const router = express.Router();

router.post("/buy", checkToken, async (req, res, next) => {
  res.send("buy");
});
router.post("/sell", checkToken, async (req, res, next) => {
  res.send("buy");
});
export default router;
