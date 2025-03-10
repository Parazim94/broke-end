import { User } from "../models/User";
import { Order } from "../models/Orders";
import newToken from "../controllers/newToken";

const createStandardResponse = async (email: string, token: string) => {
  const user = await User.findOne({ email });
  const userObject = user?.toJSON();
  if (!user) throw new Error("User not found!");
  const orders = await Order.find({ user_id: user._id });
  //neues token und altes speichern
  const updatedToken = await newToken(token, email);
  return { ...userObject, token: updatedToken, orders };
};
export default createStandardResponse;
