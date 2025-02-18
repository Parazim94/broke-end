import jsonwebtoken from "jsonwebtoken";

export const createJwt = (email: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret || !email) {
    throw new Error("No JWT_SECRET or no email!");
  }
  return jsonwebtoken.sign({ email: email }, secret);
};
