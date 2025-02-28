import express from "express";
import { manageOrders } from "../controllers/manageOrders";
const router = express.Router();

// Globale Cache-Variablen für CoinGecko
let cachedData: any = null;
let lastFetchTime: number = 0;
// Globale Cache-Variablen für Binance
let binanceCache: any[] = [];
let lastBinanceFetchTime: number = 0;

router.get("/", async (req, res, next) => {
  const now = Date.now();
  const fetchDelay = 30 * 1000;
  // CoinGecko-Daten abrufen, falls älter als 30 Sekunden
  if (!cachedData || now - lastFetchTime > fetchDelay) {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true"
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        cachedData = data;
        lastFetchTime = now;
      } else {
        throw new Error("Unerwartetes Datenformat von CoinGecko");
      }
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
  // Überprüfen, ob Binance-Daten älter als 1 Sekunde sind
  if (now - lastBinanceFetchTime > 10000) {
    try {
      const binanceResp = await fetch(
        "https://api.binance.us/api/v3/ticker/24hr"
      );
      const binanceData = await binanceResp.json();

      //orders check
      manageOrders(binanceData);

      if (Array.isArray(binanceData)) {
        binanceCache = binanceData;
        lastBinanceFetchTime = now;
      } else {
        console.error("Binance API gab kein Array zurück:", binanceData);
      }
    } catch (err) {
      console.error("Fehler beim Abrufen der Binance-Daten:", err);
    }
  }
  // Mergen: Nur image und sparkline von CoinGecko, übrige Daten von Binance
  const mergedData = cachedData.map((coin: any) => {
    const coinSymbolUpper = coin.symbol.toUpperCase();
    const binanceInfo =
      Array.isArray(binanceCache) &&
      binanceCache.find((ticker: any) =>
        ticker.symbol.endsWith(coinSymbolUpper)
      );
    // console.log(binanceInfo);
    return {
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      current_price: binanceInfo
        ? Number(binanceInfo.lastPrice)
        : coin.current_price,
      price_change_percentage_24h: binanceInfo
        ? Number(binanceInfo.priceChangePercent)
        : coin.price_change_percentage_24h,
      high_24h: binanceInfo ? Number(binanceInfo.highPrice) : coin.high_24h,
      low_24h: binanceInfo ? Number(binanceInfo.lowPrice) : coin.low_24h,
      total_volume: binanceInfo
        ? Number(binanceInfo.volume)
        : coin.total_volume,
      market_cap: coin.market_cap,
      image: coin.image,
      sparkline: coin.sparkline_in_7d,
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
