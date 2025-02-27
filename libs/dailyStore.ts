import { User } from "../models/User";

// export function dailyStore(): void {
//   const now = new Date();
//   console.log(now);

//   const midnight = new Date(now);

//   midnight.setHours(24, 0, 0, 0); // Set to next midnight

//   let timeUntilMidnight: number = midnight.getTime() - now.getTime(); // Time in milliseconds until midnight

//   timeUntilMidnight = 60000;
//   // Set a timeout to run the task at midnight
//   setTimeout(() => {
//     runAtMidnight(); // Execute the task
//     dailyStore(); // Schedule the task again for the next day
//   }, timeUntilMidnight);
// }

export async function runAtMidnight(): Promise<void> {
  const users = await User.find();

  // Process each user one at a time
  for (const user of users) {
    let total: number = user.cash;
    const positions = Object.keys(user.positions);

    // Process each position one at a time
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
