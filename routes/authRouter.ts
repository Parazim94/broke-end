import express from "express";
// import session from "express-session";
// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User";
import { DeletedToken } from "../models/DeletedToken";
import { hash, compare } from "../libs/crypto";
import { createJwt } from "../libs/jwt";
import { checkToken, CustomRequest } from "../middleware/checkToken";
// import { checkEmail } from "../middleware/checkEmail";
import { Error } from "../models/Error";
import { Order } from "../models/Orders";
import sendVerificationEmail from "../libs/sendVerificationEmail";
import createStandardResponse from "../libs/createStandardResponse";
import axios from "axios";
const router = express.Router();

router.post("/google", async (req, res, next) => {
  try {
    await Error.create({
      date: Date.now(),
      error: `Google Auth route`,
    });

    const { token } = req.body; // token sent from your React Native app
    // Request user info from Google API using the access token
    const response = await axios.get(
      "https://www.googleapis.com/userinfo/v2/me",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const userInfo = response.data;
    const email = userInfo.email;
    // Benutzer finden oder erstellen
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        userName: userInfo.name,
        email,
        age: 18, // Standardalter
        method: "google",
        hashedPW: "GoogleAuth",
        isVerified: true,
      });
    }

    // JWT erstellen und Antwort senden
    const jwt = createJwt(email);
    const userObject = user.toJSON();
    const orders = await Order.find({ user_id: user._id });

    res.status(200).send({ ...userObject, token: jwt, orders });
  } catch (error) {
    await Error.create({
      date: Date.now(),
      error: `Google Auth Error:${error}`,
    });

    next(error);
  }
});

// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   async (req, res, next) => {
//     // Successful authentication
//     const email = (req.user as any).emails[0].value;
//     let user = await User.findOne({ email });
//     if (!user) {
//       const userName = req.body.displayName;

//       user = await User.create({
//         userName,
//         email,
//         age: 66,
//         method: "google",
//         hashedPW: "Googlekowski",
//       });
//     }
//     const jwt = createJwt(email);
//     const userObject = user.toJSON();
//     const orders = await Order.find({ user_id: user._id });
//     res.status(200).send({ ...userObject, token: jwt, orders });
//   }
// );

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
      if (!user.isVerified) {
        throw new Error("email not verified!");
      }
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

router.post("/verify", checkToken, async (req: CustomRequest, res, next) => {
  try {
    await User.updateOne({ email: req.user.email }, { isVerified: true });
    const user = await User.findOne({ email: req.user.email });
    if (user) {
      res.send(await createStandardResponse(req.user.email, req.body.token));
    }
  } catch (error) {
    next(error);
  }
});
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
