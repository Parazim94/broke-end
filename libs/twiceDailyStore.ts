import { User } from "../models/User";

export function twiceDailyStore(): void {
  const now = new Date();

  // Determine the next target time (either 12am or 12pm)
  let targetTime = new Date(now);

  const currentHour = now.getHours();

  if (currentHour < 12) {
    // Next target is noon (12pm)
    targetTime.setHours(12, 0, 0, 0);
  } else {
    // Next target is midnight (12am of the next day)
    targetTime.setDate(targetTime.getDate() + 1);
    targetTime.setHours(0, 0, 0, 0);
  }

  let timeUntilTarget: number = targetTime.getTime() - now.getTime();

  setTimeout(() => {
    runUpdateTask(); // Execute the task

    // Clean up old history once per day at midnight
    // if (new Date().getHours() === 0) {
    //   cleanupOldHistory();
    // }

    twiceDailyStore(); // Schedule the next update
  }, timeUntilTarget);

  // Log when the next update will occur
  console.log(
    `Next portfolio update scheduled for: ${targetTime.toLocaleString()}`
  );
}

export async function runUpdateTask(): Promise<void> {
  console.log(`Running portfolio update at: ${new Date().toLocaleString()}`);

  try {
    const users = await User.find();
    console.log(`Processing ${users.length} users`);

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

        if (!response.ok) throw new Error("Fehler beim Abrufen der Preisdaten");

        const data = await response.json();

        total += data.price * user.positions[key];
      }

      const date = Date.now();
      user.history.push({ total, date });
      if (user.history.length > 750) {
        // Keep only the newest 750 entries
        user.history.splice(0, user.history.length - 750);
      }
      await user.save();
    }

    console.log("Portfolio update completed successfully");
  } catch (error) {
    console.error("Error during portfolio update:", error);
  }
}
