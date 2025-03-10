import express from "express";
import { checkToken, CustomRequest } from "../middleware/checkToken";
import { checkEmail } from "../middleware/checkEmail";
import { User } from "../models/User";
import newToken from "../controllers/newToken";
import { Order } from "../models/Orders";
import trade from "../controllers/trade";
import createStandardResponse from "../libs/createStandardResponse";
const router = express.Router();

router.post("/", checkToken, async (req: CustomRequest, res, next) => {
  try {
    const { symbol, value } = req.body;
    if (!symbol) throw new Error("No coin sumbmittet");
    const binanceSymbol = symbol.toUpperCase() + "USDT";
    const user = req.user;
    await trade(symbol, binanceSymbol, value, user);
    // Fetch updated user data
    const updatedUser = await User.findById(req.user._id);
    if (!updatedUser) throw new Error("User not found after trade");

    //neues token und altes speichern

    res.send(await createStandardResponse(updatedUser.email, req.body.token));
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
    res.send(await createStandardResponse(req.user.email, req.body.token));
  } catch (error) {
    next(error);
  }
});
router.post(
  "/deleteorder",
  checkToken,
  async (req: CustomRequest, res, next) => {
    try {
      const id = req.body.order._id;
      if (!id) throw new Error("No order ID provided");

      await Order.deleteOne({ _id: id });

      res.send(await createStandardResponse(req.user.email, req.body.token));
    } catch (error) {
      next(error);
    }
  }
);
router.post("/editorder", checkToken, async (req: CustomRequest, res, next) => {
  try {
    const id = req.body.order._id;
    if (!id) throw new Error("No order ID provided");

    await Order.updateOne({ _id: id }, req.body.order);

    res.send(createStandardResponse(req.user.email, req.body.token));
  } catch (error) {
    next(error);
  }
});

export default router;
