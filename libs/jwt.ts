import jsonwebtoken from "jsonwebtoken";

export const createJwt = (email: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret || !email) {
    throw new Error("No JWT_SECRET or no email!");
  }
  const token = jsonwebtoken.sign({ email: email }, secret, {
    expiresIn: "30m",
  });
  console.log(token);
  return token;
};
