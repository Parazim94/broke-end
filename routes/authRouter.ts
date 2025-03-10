import express from "express";
import { User } from "../models/User";
import { DeletedToken } from "../models/DeletedToken";
import { hash, compare } from "../libs/crypto";
import { createJwt } from "../libs/jwt";
import { checkToken, CustomRequest } from "../middleware/checkToken";
import { checkEmail } from "../middleware/checkEmail";
import { Order } from "../models/Orders";
import sendVerificationEmail from "../libs/sendVerificationEmail";
const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { userName, email, password, age } = req.body;
    const hashedPassword = await hash(password);
    const newUser = await User.create({
      userName,
      email,
      age,
      hashedPW: hashedPassword,
    });
    sendVerificationEmail(email);
    res.send(newUser);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (user && user.hashedPW && (await compare(password, user.hashedPW))) {
      const jwt = createJwt(user.email);
      const userObject = user.toJSON();
      const orders = await Order.find({ user_id: user._id });
      res.status(200).send({ ...userObject, token: jwt, orders });
    } else {
      throw new Error("Login Fehler");
    }
  } catch (error) {
    next(error);
  }
});

router.get("/logout", async (req, res, next) => {
  const token = req.body.token;
  let message;
  if (token) {
    const deletedToken = await DeletedToken.create({ token: token });
    message = "User logged out!";
  } else message = "No user to log out!";

  res.send(message);
});

router.get(
  "/verify/:token",
  checkToken,
  async (req: CustomRequest, res, next) => {
    try {
      await User.updateOne({ email: req.user.email }, { isVerified: true });
      const user = await User.findOne({ email: req.user.email });
      if (user) {
        res.send(
          `<b style="font-size:25px;">BROKECHAIN : ${user.email} from ${user.userName} is verfied! You can login now!</b>`
        );
      }
    } catch (error) {
      next(error);
    }
  }
);
router.post("/verificationemail", async (req, res, next) => {
  try {
    const email = req.body.email;
    if (await User.findOne({ email: email })) {
      sendVerificationEmail(email);
      res.send("Verification mail send.");
    } else {
      throw new Error("No user with the email found");
    }
  } catch (error) {
    next(error);
  }
});
export default router;
