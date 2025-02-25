import { now } from "mongoose";
import { User } from "../models/User";

export function dailyStore(): void {
  const now: Date = new Date();
  const midnight: Date = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Set to next midnight

  const timeUntilMidnight: number = midnight.getTime() - now.getTime(); // Time in milliseconds until midnight

  // Set a timeout to run the task at midnight
  setTimeout(() => {
    runAtMidnight(); // Execute the task
    dailyStore(); // Schedule the task again for the next day
  }, timeUntilMidnight);
}

async function runAtMidnight(): Promise<void> {
  const users = await User.find();

  users.forEach(async (user) => {
    let total: number = user.cash;
    await Object.keys(user.positions).forEach(async (key) => {
      const binanceSymbol = key.toUpperCase() + "USDT";
      try {
        const response = await fetch(
          `https://api.binance.us/api/v3/ticker/price?symbol=${binanceSymbol}`
        );

        if (!response.ok)
          throw new Error("Fehler beim taeglichen price-fetching");

        const price = await response.json();
        total += price * user.positions[key];
      } catch (error) {}
    });
    user.history = [] as any;
    const date = Date.now();
    user.history.push({ total, date });
    await user.save();

    console.log(user.history);
  });
}
