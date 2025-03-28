import { User } from "../models/User";
import { IUser } from "../types/user";
const trade = async (
  symbol: string,
  binanceSymbol: string,
  value: number,
  user: IUser
) => {
  if (binanceSymbol) {
    const response = await fetch(
      `https://api.binance.us/api/v3/ticker/price?symbol=${binanceSymbol}`
    );
    if (!response.ok)
      throw new Error(`kein fetch!: ${response.status} ${response.statusText}`);
    const data = await response.json();
    const price = await data.price;

    if (value === 0) throw new Error("sehr witzig...");
    if (!user.positions) user.positions = {};
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
      const dCash = value * price;
      user.cash = user.cash - dCash;
      user.positions[symbol] += value;
    }
    if (user.positions[symbol] === 0) delete user.positions[symbol];
    const newUser = await User.updateOne({ _id: user._id }, user);

    await storeTrade(symbol, price, value, false, user.email);
    return newUser;
  }
};
export default trade;

export async function storeTrade(
  symbol: string,
  price: number,
  amount: number,
  order: boolean,
  email: string
) {
  const user = await User.findOne({ email: email });
  const tradeHistory = user?.tradeHistory;
  tradeHistory?.push({ symbol, price, amount, order, date: Date.now() });

  await User.updateOne(
    { email: email },
    {
      tradeHistory: tradeHistory,
    }
  );
}
