import bcrypt from "bcrypt";

export const hash = async (password: string) => {
  return bcrypt.hash(password, 10);
};
export const compare = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};
