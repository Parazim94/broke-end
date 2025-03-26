import express from "express";
import { manageOrders } from "../controllers/manageOrders";
import { completeData } from "../libs/intervalFetchData";
import { BinanceTicker, CoinGeckoCoin } from "../types/tradeInterfaces";
const router = express.Router();

// Globale Cache-Variablen für CoinGecko
// let cachedData: CoinGeckoCoin = null;
let lastFetchTime: number = 0;
// Globale Cache-Variablen für Binance
let binanceCache: BinanceTicker[] = [];
let lastBinanceFetchTime: number = 0;

router.get("/", async (req, res, next) => {
  res.send(completeData);
});

router.get("/news", async (req, res, next) => {
  const RSS_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/";

  try {
    // Import xml2js at runtime if not available globally
    const xml2js = require("xml2js");
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
    });

    const response = await fetch(RSS_URL);
    const xmlData = await response.text();

    // Parse XML to JSON
    parser.parseString(xmlData, (err: any, result: any) => {
      if (err) {
        console.error("Error parsing XML:", err);
        return res.status(500).json({ error: "Failed to parse news feed" });
      }
      res.json(result);
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    next(error);
  }
});

export default router;
