import { User } from "../models/User";
import { createJwt } from "../libs/jwt";
const trade = async (
  symbol: string,
  binanceSymbol: string,
  value: number,
  user: any
) => {
  if (binanceSymbol) {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`
    );
    const data = await response.json();
    const price = data.price;
    if (value === 0) throw new Error("sehr witzig...");
    if (value > 0) {
      if (value * price > user.cash) throw new Error("not enough cash!");
      user.cash -= value * price;
      if (!user.positions[symbol]) {
        user.positions[symbol] = 0;
      }
      user.positions[symbol] += value;
    }
    if (value < 0) {
      if (-value > user.positions[symbol] || !user.positions[symbol]) {
        throw new Error(`not enough ${symbol}`);
      }
      user.cash -= value * price;
      user.positions[symbol] += value;
    }
    console.log(user.cash);
    await User.updateOne({ _id: user._id }, user);
    //token erneuern
    user.token = createJwt(user.email);
    return user;
    // res.send(user);
  }
};
export default trade;
