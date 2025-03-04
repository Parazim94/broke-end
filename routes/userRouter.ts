import express from "express";
import { checkToken, CustomRequest } from "../middleware/checkToken";
import { User } from "../models/User";
import { Order } from "../models/Orders";
import newToken from "../controllers/newToken";

const router = express.Router();

router.post("/settings", checkToken, async (req: CustomRequest, res, next) => {
  try {
    //loeschen,damit das nicht geaendert wird
    delete req.body.cash;
    delete req.body.positions;
    delete req.body.history;
    delete req.body.isVerified;

    await User.updateOne({ email: req.user.email }, req.body);
    const user = await User.findOne({ email: req.user.email });
    const token = req.user.token;
    const userObject = user?.toObject();
    const newUser = { ...userObject, token };

    res.send(newUser);
  } catch (error) {
    console.error("Fehler beim updaten!", error);
  }
});

router.post("/", checkToken, async (req: CustomRequest, res, next) => {
  try {
    const orders = await Order.find({ user_id: req.user._id });

    //neues token und altes speichern
    const token = await newToken(req.body.token, req.user.email);

    const newUser = { ...req.user, token, orders };
    res.send(newUser);
  } catch (error) {
    next(error);
  }
});
export default router;
