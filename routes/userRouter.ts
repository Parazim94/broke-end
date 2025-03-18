import express from "express";
import { checkToken, CustomRequest } from "../middleware/checkToken";
import { checkEmail } from "../middleware/checkEmail";
import { User } from "../models/User";
import { Order } from "../models/Orders";
import newToken from "../controllers/newToken";
import sendVerificationEmail from "../libs/sendVerificationEmail";
import { compare, hash } from "../libs/crypto";
import createStandardResponse from "../libs/createStandardResponse";
import { Error } from "../models/Error";

const router = express.Router();

router.put("/settings", checkToken, async (req: CustomRequest, res, next) => {
  console.log("User-Update angefordert von:", req.user?.email);
  console.log("Update-Daten:", req.body);

  try {
    // Loeschen, damit das nicht geaendert wird
    delete req.body.cash;
    delete req.body.positions;
    delete req.body.history;
    delete req.body.isVerified;
    delete req.body.tradeHistory;

    // Detaillierte Update-Operation mit $set
    const updateData: { [key: string]: any } = {};

    // Nur die Felder übernehmen, die tatsächlich geändert werden sollen
    Object.keys(req.body).forEach((key) => {
      if (key !== "token") {
        // Token nicht in DB speichern
        updateData[key] = req.body[key];
      }
    });

    console.log("Effektive Update-Daten:", updateData);

    // Wenn displayedTools vorhanden, explizit setzen
    if (req.body.displayedTools) {
      console.log("displayedTools wird aktualisiert:", req.body.displayedTools);
    }

    const updateResult = await User.updateOne(
      { email: req.user.email },
      { $set: updateData }
    );

    console.log("Update-Ergebnis:", updateResult);

    // Prüfen ob das Update erfolgreich war
    if (updateResult.modifiedCount === 0) {
      console.log(
        "Keine Änderungen vorgenommen. Entweder User nicht gefunden oder keine Änderungen notwendig."
      );
    }

    // Validierung des Updates
    const updatedUser = await User.findOne({ email: req.user.email });
    console.log("Aktualisierter User (ohne sensible Daten):", {
      email: updatedUser?.email,
      displayedTools: updatedUser?.displayedTools,
    });

    res.send(await createStandardResponse(req.user.email, req.body.token));
  } catch (error) {
    console.error("Fehler beim updaten!", error);
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
