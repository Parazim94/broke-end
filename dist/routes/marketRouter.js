"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const manageOrders_1 = require("../controllers/manageOrders");
const router = express_1.default.Router();
// Globale Cache-Variablen für CoinGecko
let cachedData = null;
let lastFetchTime = 0;
// Globale Cache-Variablen für Binance
let binanceCache = [];
let lastBinanceFetchTime = 0;
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const now = Date.now();
    const fetchDelay = 30 * 1000;
    // CoinGecko-Daten abrufen, falls älter als 30 Sekunden
    if (!cachedData || now - lastFetchTime > fetchDelay) {
        try {
            const response = yield fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true");
            const data = yield response.json();
            if (Array.isArray(data)) {
                cachedData = data;
                lastFetchTime = now;
            }
            else {
                throw new Error("Unerwartetes Datenformat von CoinGecko");
            }
        }
        catch (error) {
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
            const binanceResp = yield fetch("https://api.binance.us/api/v3/ticker/24hr");
            const binanceData = yield binanceResp.json();
            if (Array.isArray(binanceData)) {
                binanceCache = binanceData;
                lastBinanceFetchTime = now;
                //orders check
                (0, manageOrders_1.manageOrders)(binanceData);
            }
            else {
                console.error("Binance API gab kein Array zurück:", binanceData);
            }
        }
        catch (err) {
            console.error("Fehler beim Abrufen der Binance-Daten:", err);
        }
    }
    // Mergen: Nur image und sparkline von CoinGecko, übrige Daten von Binance
    const mergedData = cachedData.map((coin) => {
        const coinSymbolUpper = coin.symbol.toUpperCase();
        const binanceInfo = Array.isArray(binanceCache) &&
            binanceCache.find((ticker) => ticker.symbol.endsWith(coinSymbolUpper + "USDT"));
        if (!binanceInfo || Number(binanceInfo.lastPrice) === 0) {
            return;
        }
        console.log(coin.name, binanceInfo.lastPrice);
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
    const filteredData = mergedData.filter((item) => item !== null && item !== undefined);
    res.send(filteredData);
}));
router.get("/news", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const RSS_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/";
    const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${RSS_URL}`;
    try {
        const response = yield fetch(API_URL);
        const data = yield response.json();
        res.send(data);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
