import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { DeletedToken } from "../models/DeletedToken";
import { createJwt } from "../libs/jwt";
import { deleteOldToken } from "../libs/deleteOldToken";
export interface CustomRequest extends Request {
  user?: any;
}

export const checkToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.body.token;
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
      const user = await User.findOne({ email: payload.email });
      const userObject = user?.toObject();
      if (!user) throw new Error("user not found");

      //token erneuern
      const newToken = createJwt(user.email);
      req.user = { ...userObject, token: newToken };

      //altes token speichern
      await DeletedToken.create({ token: token });

      //abgelaufene alte token loeschen
      deleteOldToken();

      next();
    } else {
      return next(new Error("Invalid token payload"));
    }
  } catch (err) {
    console.log("checkTokenError", err);
    return next(new Error("Token verification failed"));
  }
};
