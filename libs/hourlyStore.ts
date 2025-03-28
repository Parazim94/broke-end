import { User } from "../models/User";

export function hourlyStore(): void {
  const now = new Date();

  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Set to next hour (XX:00:00)

  let timeUntilNextHour: number = nextHour.getTime() - now.getTime(); // Time in milliseconds until next hour

  setTimeout(() => {
    runHourlyUpdate(); // Execute the task
    hourlyStore(); // Schedule the task again for the next hour
  }, timeUntilNextHour);
}

export async function runHourlyUpdate(): Promise<void> {
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
        throw new Error("Fehler beim stündlichen price-fetching");

      const data = await response.json();

      total += data.price * user.positions[key];
    }

    const date = Date.now();
    user.history.push({ total, date });
    await user.save();
  }
}
