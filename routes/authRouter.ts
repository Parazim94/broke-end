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
      const userObject = user.toObject();
      res.status(200).send({ ...userObject, token: jwt });
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

export default router;
