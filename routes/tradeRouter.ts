import express from "express";
import { checkToken, CustomRequest } from "../middleware/checkToken";
import { User } from "../models/User";

import { Order } from "../models/Orders";
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

router.post("/order", checkToken, async (req: CustomRequest, res, next) => {
  try {
    const { symbol, amount, threshold } = req.body;
    if (!symbol || !amount || !threshold)
      throw new Error("wrong data to order");

    const newOrder = await Order.create({
      symbol,
      amount,
      threshold,
      user_id: req.user._id,
    });
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

export default router;
