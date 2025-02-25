import express from "express";
import { checkToken, CustomRequest } from "../middleware/checkToken";
import { User } from "../models/User";
import trade from "../controllers/trade";
const router = express.Router();

router.post("/", checkToken, async (req: CustomRequest, res, next) => {
  try {
    const { symbol, value } = req.body;
    const binanceSymbol = symbol.toUpperCase() + "USDT";
    const user = req.user;

    const UserAfterTrade = await trade(symbol, binanceSymbol, value, user);

    res.send(UserAfterTrade);
  } catch (error) {
    next(error);
  }
});

export default router;
