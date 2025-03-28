import { DeletedToken } from "../models/DeletedToken";
import jwt from "jsonwebtoken";

export const deleteOldToken = async () => {
  const tokenArray = await DeletedToken.find();
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  for (const token of tokenArray) {
    const oldToken: string = token.token as string;
    try {
      const payload = jwt.verify(oldToken, secret);
      // if (typeof payload !== "string" && "email" in payload) {

      // } else {
      //   console.log(`loeschen : ${token.token}`);
      // }
    } catch (error) {
      console.log(`loeschen : ${oldToken}`);
      await DeletedToken.deleteOne({ token: oldToken });
    }
  }
};
