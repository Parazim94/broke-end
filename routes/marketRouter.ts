import express from "express";
import { completeData } from "../libs/intervalFetchData";
import xml2js from "xml2js";
const router = express.Router();

router.get("/", async (req, res, next) => {
  res.send(completeData);
});

router.get("/news", async (req, res, next) => {
  const RSS_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/";

  try {
    // Import xml2js at runtime if not available globally
    // const xml2js = require("xml2js");
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
