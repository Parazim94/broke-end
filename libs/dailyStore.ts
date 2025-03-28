import { User } from "../models/User";

export function dailyStore(): void {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  let timeUntilMidnight: number = midnight.getTime() - now.getTime();

  setTimeout(() => {
    runAtMidnight();
    dailyStore();
  }, timeUntilMidnight);
}

export async function runAtMidnight(): Promise<void> {
  const users = await User.find();

  // each user
  for (const user of users) {
    let total: number = user.cash;
    const positions = Object.keys(user.positions);

    // each position
    for (const key of positions) {
      const binanceSymbol = key.toUpperCase() + "USDT";

      const response = await fetch(
        `https://api.binance.us/api/v3/ticker/price?symbol=${binanceSymbol}`
      );

      if (!response.ok)
        throw new Error("Fehler beim taeglichen price-fetching");

      const data = await response.json();

      total += data.price * user.positions[key];
    }

    const date = Date.now();
    user.history.push({ total, date });
    await user.save();
  }
}
