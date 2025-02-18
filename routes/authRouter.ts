import express from "express";
import { User } from "../models/User";
import { DeletedToken } from "../models/DeletedToken";
import { hash, compare } from "../libs/crypto";
import { createJwt } from "../libs/jwt";
import { checkToken } from "../middleware/checkToken";
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
    res.send(newUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (user && user.hashedPW && (await compare(password, user.hashedPW))) {
      const jwt = createJwt(user.email);
      res.cookie("jwt", jwt, {
        httpOnly: true,
        secure: false, // Setze dies auf true, wenn du HTTPS verwendest
        sameSite: "lax",
        maxAge: 3600000,
      });
      res.status(200).send(user);
    } else {
      throw new Error("Login Fehler");
    }
  } catch (error) {
    next(error);
  }
});

router.get("/logout", async (req, res, next) => {
  const token = req.cookies.jwt || req.body.token;
  if (token) {
    const deletedToken = await DeletedToken.create({ token: token });
  }
  res.clearCookie("jwt", { httpOnly: true, secure: false, sameSite: "lax" });
  res.send("User logged out!");
});

router.get("/test", checkToken, (req, res, next) => {
  res.send("test");
});

export default router;
