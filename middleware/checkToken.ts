import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { DeletedToken } from "../models/DeletedToken";
export interface CustomRequest extends Request {
  user?: any;
}

export const checkToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.body.token;
  console.log(token);
  const deletedToken = await DeletedToken.findOne({ token: token });
  if (deletedToken?.token) return next(new Error("is logged out!"));
  if (!token) {
    return next(new Error("no token!"));
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.log("no secret");
    return next(new Error("JWT secret is not defined"));
  }
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload !== "string" && "email" in payload) {
      req.user = await User.find({ email: payload.email });
    } else {
      return next(new Error("Invalid token payload"));
    }

    next();
  } catch (err) {
    console.log("checkTokenError", err);
    return next(new Error("Token verification failed"));
  }
};
