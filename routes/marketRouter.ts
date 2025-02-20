import express from "express";

const router = express.Router();

// Globale Cache-Variablen für CoinGecko
let cachedData: any = null;
let lastFetchTime: number = 0;
// Globale Cache-Variablen für Binance
let binanceCache: any[] = [];
let lastBinanceFetchTime: number = 0;

router.get("/", async (req, res, next) => {
  const now = Date.now();
  const halfminute = 30 * 1000;
  // CoinGecko-Daten abrufen, falls älter als 30 Sekunden
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
      if (cachedData) {
        res.send(cachedData);
        return;
      }
      res.status(500).send({ error: "Fehler beim Abrufen der Daten" });
      return;
    }
  }
  // Binance-Daten aktualisieren, falls älter als 1 Sekunde
  if (now - lastBinanceFetchTime > 1000) {
    try {
      const binanceResp = await fetch("https://api.binance.com/api/v3/ticker/24hr");
      binanceCache = await binanceResp.json();
      lastBinanceFetchTime = now;
    } catch (err) {
      console.error("Fehler beim Abrufen der Binance-Daten:", err);
    }
  }
  // Mergen: Verwende für id, name, symbol, market_cap, image und sparkline die CoinGecko-Daten,
  // und für current_price, price_change_percentage_24h, high_24h, low_24h und total_volume die Binance-Daten.
  const mergedData = cachedData.map((coin: any) => {
    const coinSymbolUpper = coin.symbol.toUpperCase();
    const binanceInfo = binanceCache.find((ticker: any) =>
      ticker.symbol.endsWith(coinSymbolUpper)
    );
    return {
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      current_price: binanceInfo ? Number(binanceInfo.lastPrice) : coin.current_price,
      price_change_percentage_24h: binanceInfo ? Number(binanceInfo.priceChangePercent) : coin.price_change_percentage_24h,
      high_24h: binanceInfo ? Number(binanceInfo.highPrice) : coin.high_24h,
      low_24h: binanceInfo ? Number(binanceInfo.lowPrice) : coin.low_24h,
      total_volume: binanceInfo ? Number(binanceInfo.volume) : coin.total_volume,
      market_cap: coin.market_cap,
      image: coin.image,
      sparkline: coin.sparkline_in_7d
    };
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
