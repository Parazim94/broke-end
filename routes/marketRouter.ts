import express from "express";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true"
    );
    const data = await response.json();
    res.send(data);
  } catch (error) {
    console.error("Fehler beim Abrufen der CoinGecko-Daten:", error);
  }
});
export default router;
