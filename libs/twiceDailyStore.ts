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
        console.log(`Trimmed history to 750 entries for user: ${user.email}`);
      }
      await user.save();
    }

    console.log("Portfolio update completed successfully");
  } catch (error) {
    console.error("Error during portfolio update:", error);
  }
}

/**
 * Removes history entries older than one year for all users
 */
// export async function cleanupOldHistory(): Promise<void> {
//   console.log("Starting cleanup of old history data");

//   try {
//     // Calculate the date one year ago
//     const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

//     const users = await User.find();
//     console.log(`Cleaning history for ${users.length} users`);

//     let totalEntriesRemoved = 0;

//     for (const user of users) {
//       // Count original entries
//       const originalLength = user.history.length;

//       // Filter out entries older than one year
//       const entriesToKeep = [];
//       for (const entry of user.history) {
//         if (entry.date != null && Number(entry.date) >= oneYearAgo) {
//           entriesToKeep.push(entry);
//         }
//       }

//       // Clear the array and push the entries to keep
//       user.history.splice(0, user.history.length);
//       entriesToKeep.forEach(entry => user.history.push(entry));

//       // Calculate how many entries were removed
//       const entriesRemoved = originalLength - user.history.length;
//       totalEntriesRemoved += entriesRemoved;

//       if (entriesRemoved > 0) {
//         await user.save();
//         console.log(
//           `Removed ${entriesRemoved} old history entries for user: ${user.email}`
//         );
//       }
//     }

//     console.log(
//       `History cleanup complete. Removed ${totalEntriesRemoved} old entries.`
//     );
//   } catch (error) {
//     console.error("Error during history cleanup:", error);
//   }
// }
