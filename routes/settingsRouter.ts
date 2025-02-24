import express from "express";
import { checkToken, CustomRequest } from "../middleware/checkToken";
import { User } from "../models/User";
import { findPackageJSON } from "module";
const router = express.Router();

router.post("/", checkToken, async (req: CustomRequest, res, next) => {
  try {
    console.log("updateOne falsch");
    await User.updateOne({ email: req.user.email }, req.body);
    const user = await User.findOne({ email: req.user.email });
    res.send(user);
  } catch (error) {
    console.error("Fehler beim updaten!", error);
  }
});
export default router;
