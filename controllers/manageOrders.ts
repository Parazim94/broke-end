import { User } from "../models/User";
import { Order } from "../models/Orders";

interface BinanceCache {
  [key: string]: any; // This represents the binance cache object
}

export const manageOrders = async (
  binanceCache: BinanceCache
): Promise<void> => {
  const orders = await Order.find();
  for (const order of orders) {
    const user = await User.findOne({ _id: order.user_id });

    const key = order.symbol;
    const coin = binanceCache.find(
      (coin: any) => coin.symbol === `${key.toUpperCase()}USDT`
    );

    //kaufen?
    if (order.amount > 0) {
      //es geht ums kaufen kaufen!

      if (coin.lastPrice <= order.threshold) {
        const orderPrice = coin.lastPrice * order.amount;
        if ((user?.cash ?? 0) >= orderPrice) {
          if (user && user.positions) {
            user.positions[key] = (user.positions[key] || 0) + order.amount;
            user.cash -= orderPrice;
            const newUser = await User.updateOne({ _id: user._id }, user);
            await Order.deleteOne({ _id: order._id });
          }
        }
      }
    } else {
      //verkaufen

      if (coin.lastPrice >= order.threshold) {
        const orderPrice = coin.lastPrice * order.amount;
        if (user?.positions[key] >= order.amount) {
          console.log(user?.userName);
          if (user && user.positions) {
            user.positions[key] = (user.positions[key] || 0) + order.amount;
            user.cash -= orderPrice;
            const newUser = await User.updateOne({ _id: user._id }, user);
            await Order.deleteOne({ _id: order._id });
          }
        }
      }
    }
  }
};
