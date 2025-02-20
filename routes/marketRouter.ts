import express from "express";

const router = express.Router();

// Globale Cache-Variablen
let cachedData: any = null;
let lastFetchTime: number = 0;

router.get("/", async (req, res, next) => {
  const now = Date.now();
  const halfminute = 30 * 1000;
  // Prüfen, ob die Daten älter als 30 Sekunden sind
  if (!cachedData || now - lastFetchTime > halfminute) {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true"
      );
      const data = await response.json();
      cachedData = data;
      lastFetchTime = now;
    } catch (error) {
      console.error("Fehler beim Abrufen der CoinGecko-Daten:", error);
      // Falls es einen Fehler gibt und Cache vorhanden ist, wird dieser genutzt.
      if (cachedData) {
        res.send(cachedData);
        return;
      }
      // Andernfalls wird ein Fehlerstatus gesendet.
      res.status(500).send({ error: "Fehler beim Abrufen der Daten" });
      return;
    }
  }
  // Binance-Daten abrufen
  let binanceData: any[] = [];
  try {
    const binanceResp = await fetch("https://api.binance.com/api/v3/ticker/24hr");
    binanceData = await binanceResp.json();
  } catch (err) {
    console.error("Fehler beim Abrufen der Binance-Daten:", err);
  }
  // Mergen: Für jedes Coin werden entsprechende Binance-Preis-Daten angehängt
  const mergedData = cachedData.map((coin: any) => {
    const coinSymbolUpper = coin.symbol.toUpperCase();
    const binanceInfo = binanceData.find((ticker: any) =>
      ticker.symbol.endsWith(coinSymbolUpper)
    );
    return { ...coin, binance: binanceInfo || null };
  });
  res.send(mergedData);
});

router.get("/news", async (req, res, next) => {
  const RSS_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/";
  const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${RSS_URL}`;
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    res.send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
