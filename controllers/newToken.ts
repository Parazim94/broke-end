import { createJwt } from "../libs/jwt";
import { User } from "../models/User";
import { DeletedToken } from "../models/DeletedToken";
import { deleteOldToken } from "../libs/deleteOldToken";
const newToken = async (token: string, email: string) => {
  //token erneuern
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new Error("no user found at building new token!");
  }

  //altes token speichern
  await DeletedToken.create({ token: token });

  //abgelaufene alte token loeschen
  deleteOldToken();
  const newToken = createJwt(user.email);
  return newToken;
};
export default newToken;
