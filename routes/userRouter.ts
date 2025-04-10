import express from "express";
import { checkToken, CustomRequest } from "../middleware/checkToken";
import { checkEmail } from "../middleware/checkEmail";
import { User } from "../models/User";
import { DeletedUser } from "../models/DeletedUser";
import { Order } from "../models/Orders";
import newToken from "../controllers/newToken";
import sendVerificationEmail from "../libs/sendVerificationEmail";
import { compare, hash } from "../libs/crypto";
import createStandardResponse from "../libs/createStandardResponse";
import { AppError } from "../models/Error";

const router = express.Router();

router.put("/settings", checkToken, async (req: CustomRequest, res, next) => {
  try {
    //loeschen,damit das nicht geaendert wird
    delete req.body.cash;
    delete req.body.positions;
    delete req.body.history;
    delete req.body.isVerified;
    delete req.body.tradeHistory;
    const updateResult = await User.updateOne(
      { email: req.user.email },
      { $set: req.body }
    );

    res.send(await createStandardResponse(req.user.email, req.body.token));
  } catch (error) {
    console.error("Fehler beim updaten!", error);
    next(error);
  }
});

router.post("/", checkToken, async (req: CustomRequest, res, next) => {
  try {
    res.json(await createStandardResponse(req.user.email, req.body.token));
  } catch (error) {
    next(error);
  }
});

router.put(
  "/change_password",
  checkToken,
  async (req: CustomRequest, res, next) => {
    try {
      if (req.body.newPassword && req.body.password) {
        const user = await User.findOne({ email: req.user.email });
        if (user && (await compare(req.body.password, user.hashedPW))) {
          const hashedPW = await hash(req.body.newPassword);
          await User.updateOne({ email: req.user.email }, { hashedPW });

          res.json(
            await createStandardResponse(req.user.email, req.body.token)
          );
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
router.delete("/delete", checkToken, async (req: CustomRequest, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      throw new Error("User not found");
    }
    await User.deleteOne({ email: req.user.email });
    // user backup
    // const userObject = user.toObject();
    // const userObjectWithOptionalId = userObject as { _id?: any };
    // delete userObjectWithOptionalId._id;
    // await DeletedUser.create(userObjectWithOptionalId);
    res.send("deleted");
  } catch (error) {
    next(error);
  }
});
router.put(
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

      sendVerificationEmail(newEmail);

      res.json(await createStandardResponse(newEmail, req.body.token));
    } catch (error) {
      next(error);
    }
  }
);
export default router;
