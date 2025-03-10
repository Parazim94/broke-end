import express from "express";
import { checkToken, CustomRequest } from "../middleware/checkToken";
import { checkEmail } from "../middleware/checkEmail";
import { User } from "../models/User";
import { Order } from "../models/Orders";
import newToken from "../controllers/newToken";
import sendVerificationEmail from "../libs/sendVerificationEmail";
import { compare, hash } from "../libs/crypto";

const router = express.Router();

router.post("/settings", checkToken, async (req: CustomRequest, res, next) => {
  try {
    //loeschen,damit das nicht geaendert wird
    delete req.body.cash;
    delete req.body.positions;
    delete req.body.history;
    delete req.body.isVerified;
    delete req.body.tradeHistory;
    await User.updateOne({ email: req.user.email }, req.body);
    const user = await User.findOne({ email: req.user.email });

    const userObject = user?.toObject();

    //neues token und altes speichern
    const token = await newToken(req.body.token, req.user.email);

    const newUser = { ...userObject, token };

    res.send(newUser);

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

    res.json(newUser);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/change_password",
  checkToken,
  async (req: CustomRequest, res, next) => {
    try {
      if (req.body.newPassword && req.body.password) {
        const user = await User.findOne({ email: req.user.email });
        if (user && (await compare(req.body.password, user.hashedPW))) {
          const hashedPW = await hash(req.body.newPassword);
          await User.updateOne({ email: req.user.email }, { hashedPW });
          const orders = await Order.find({ user_id: req.user._id });
          //neues token und altes speichern
          const token = await newToken(req.body.token, req.user.email);
          const newUser = { ...req.user, token, orders };
          res.json(newUser);
        } else {
          throw new Error("wrong old password or user not found!");
        }
      } else {
        throw new Error("wrong credentials!");
      }
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/change_email",
  checkToken,
  async (req: CustomRequest, res, next) => {
    try {
      const newEmail = req.body.newEmail;
      if (!newEmail) {
        throw new Error("no new email provided.");
      }
      await User.updateOne(
        { email: req.user.email },
        { email: newEmail, oldEmail: req.user.email, isVerified: false }
      );
      const updatedUser = await User.findOne({ email: newEmail });
      const userObject = updatedUser?.toJSON();

      sendVerificationEmail(newEmail);

      const orders = await Order.find({ user_id: req.user._id });

      //neues token und altes speichern
      const token = await newToken(req.body.token, newEmail);

      const newUser = { ...userObject, token, orders };
      res.json(newUser);
    } catch (error) {
      next(error);
    }
  }
);
export default router;
