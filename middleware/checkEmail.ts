import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "./checkToken";
import { User } from "../models/User";
export const checkEmail = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      throw new Error("user not found in checkEmail!!");
    } else {
      if (!user.isVerified) {
        throw new Error("Email not verified!");
      } else next();
    }
  } catch (error) {
    next(error);
  }
};
