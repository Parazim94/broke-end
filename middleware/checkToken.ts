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
  const token = req.body.token || req.params.token;
  const deletedToken = await DeletedToken.findOne({ token: token });
  if (deletedToken?.token) return next(new Error("is logged out!"));
  if (!token) {
    return next(new Error("no token!"));
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new Error("JWT secret is not defined"));
  }
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload !== "string" && "email" in payload) {
      const user = await User.findOne({ email: payload.email });
      req.user = user?.toJSON();
      if (!user) throw new Error("user not found");

      next();
    } else {
      return next(new Error("Invalid token payload"));
    }
  } catch (err) {
    return next(new Error("Token verification failed"));
  }
};
