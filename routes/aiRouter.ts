import express from "express";
import { User } from "../models/User";
import { checkToken, CustomRequest } from "../middleware/checkToken";
import createStandardResponse from "../libs/createStandardResponse";
import getAiAnswers from "../controllers/getAiAnswers";
const router = express.Router();

router.post("/", checkToken, async (req: CustomRequest, res, next) => {
  try {
    if (req.body.message) {
      const message = await getAiAnswers(req.body.message);

      const response = await createStandardResponse(
        req.user.email,
        req.body.token
      );

      res.json({ ...response, message });
    }
  } catch (error) {}
});

export default router;
