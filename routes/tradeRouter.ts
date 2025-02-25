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

    const UserAfterTrade = await trade(symbol,binanceSymbol, value, user);
    // if (binanceSymbol) {
    //   const response = await fetch(
    //     `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`
    //   );
    //   const data = await response.json();
    //   const price = data.price;
    //   if (value === 0) throw new Error("sehr witzig...");
    //   if (value > 0) {
    //     if (value * price > user.cash) throw new Error("not enough cash!");
    //     user.cash -= value * price;
    //     if (!user.positions[binanceSymbol]) {
    //       user.positions[binanceSymbol] = 0;
    //     }
    //     user.positions[binanceSymbol] += value;
    //   }
    //   if (value < 0) {
    //     if (
    //       -value > user.positions[binanceSymbol] ||
    //       !user.positions[binanceSymbol]
    //     ) {
    //       throw new Error(`not enough ${symbol}`);
    //     }
    //     user.cash -= value * price;
    //     user.positions[binanceSymbol] += value;
    //   }
    //   console.log(user.cash);
    //   await User.updateOne({ _id: user._id }, user);
    //   res.send(user);
    res.send(UserAfterTrade);
  } catch (error) {
    next(error);
  }
});

export default router;
