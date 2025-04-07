import { manageOrders } from "../controllers/manageOrders";
import {
  CoinGeckoCoin,
  BinanceTicker,
  MergedCoinData,
} from "../types/tradeInterfaces";
let coinInterval = 1;
let coinGeckoData: CoinGeckoCoin[] = [];
let binanceData: BinanceTicker[] = [];
export let completeData: MergedCoinData[] = [];
const intervalFetchData = () => {
  setInterval(async () => {
    coinInterval--;
    if (coinInterval === 0) {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true"
        );
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unerwartetes Datenformat von CoinGecko");
        } else {
          coinInterval = 20;
          coinGeckoData = data;
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der CoinGecko-Daten:", error);
      }
    }

    try {
      const binanceResp = await fetch(
        "https://api.binance.us/api/v3/ticker/24hr"
      );
      binanceData = await binanceResp.json();

      if (!Array.isArray(binanceData)) {
        throw new Error("Unerwartetes Datenformat von Binance");
      } else {
        //orders check
        manageOrders(binanceData);

        // Mergen: Nur image und sparkline von CoinGecko, übrige Daten von Binance
        const mergedData = coinGeckoData
          .map((coin: CoinGeckoCoin) => {
            const coinSymbolUpper = coin.symbol.toUpperCase();
            const binanceInfo =
              Array.isArray(binanceData) &&
              binanceData.find((ticker: BinanceTicker) =>
                ticker.symbol.endsWith(coinSymbolUpper + "USDT")
              );
            if (!binanceInfo || Number(binanceInfo.lastPrice) === 0) {
              return;
            }

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
              high_24h: binanceInfo
                ? Number(binanceInfo.highPrice)
                : coin.high_24h,
              low_24h: binanceInfo
                ? Number(binanceInfo.lowPrice)
                : coin.low_24h,
              total_volume: binanceInfo
                ? Number(binanceInfo.volume)
                : coin.total_volume,
              market_cap: coin.market_cap,
              image: coin.image,
              sparkline: coin.sparkline_in_7d,
            };
          })
          .filter((item): item is MergedCoinData => item !== undefined);

        completeData = mergedData.filter(
          (item) => item !== null && item !== undefined
        );
      }
    } catch (err) {
      console.error("Fehler beim Abrufen der Binance-Daten:", err);
    }
  }, 5000);
};

export default intervalFetchData;
