import express from "express";
import { checkToken, CustomRequest } from "../middleware/checkToken";
import { User } from "../models/User";
const router = express.Router();

router.post("/", checkToken, (req: CustomRequest, res, next) => {
  try {
    const user = User.updateOne({ email: req.user.email }, req.body);

    res.send(user);
  } catch (error) {
    console.error("Fehler beim updaten!", error);
  }
});
export default router;
