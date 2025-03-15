import express from "express";
import { User } from "../models/User";
import { DeletedToken } from "../models/DeletedToken";
import { hash, compare } from "../libs/crypto";
import { createJwt } from "../libs/jwt";
import { checkToken, CustomRequest } from "../middleware/checkToken";
import { checkEmail } from "../middleware/checkEmail";
import { Order } from "../models/Orders";
import sendVerificationEmail from "../libs/sendVerificationEmail";
import createStandardResponse from "../libs/createStandardResponse";
import passport from "passport";

const router = express.Router();

router.post("/google", async (req, res, next) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      throw new Error("Kein accessToken übergeben");
    }
    // Google-Token verifizieren
    const googleResp = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
    );
    // Lesen Sie den Body nur einmal
    const responseText = await googleResp.text();
    console.log("Google response text:", responseText);
    if (!googleResp.ok) {
      throw new Error("Ungültiger Google accessToken");
    }
    let googleData;
    try {
      googleData = JSON.parse(responseText);
    } catch (e) {
      console.error("Fehler beim JSON parsen:", e);
      throw new Error("Fehler beim JSON parsen aus Google response");
    }
    const email = googleData.email;
    const name = googleData.name || "Google User";
    if (!email) {
      throw new Error("Kein Email-Feld im Google-Response gefunden");
    }
    // Prüfen ob User existiert, sonst erstellen
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        userName: name,
        age: 18, // Standardwert, evtl. angepasst werden
        hashedPW: "googleUser", // Platzhalter; im echten System anders behandeln
      });
      // Optional: sendVerificationEmail(email);
    }
    // Token generieren
    const token = createJwt(user.email);
    res.send({ ...user.toJSON(), token });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  async (req, res, next) => {
    try {
      const googleUser = req.user as any;
      const email = googleUser?.emails?.[0]?.value;
      const name = googleUser?.displayName || "Google User";
      if (!email) {
        throw new Error("Google user email not found");
      }
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          userName: name,
          age: 18, // Standardwert, ggf. anpassen
          hashedPW: "googleUser", // Platzhalter, da der Login über Google erfolgt
        });
        // Optional: sendVerificationEmail(email);
      }
      const token = createJwt(user.email);
      res.send({ ...user.toJSON(), token });
    } catch (error) {
      next(error);
    }
  }
);

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
