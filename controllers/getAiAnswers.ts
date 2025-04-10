import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { NewsItem } from "../types/tradeInterfaces";
dotenv.config();

const RSS_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/";
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/`;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const getAiAnswers = async (message: string) => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data && data.length != 0) {
      // Erstelle einen kurzen Überblick über die letzten 10 Nachrichten
      const recentNews = data.items ? data.items.slice(0, 10) : [];
      let newsContext = "Hier sind aktuelle Krypto-Nachrichten:\n\n";

      recentNews.forEach((item: NewsItem, index: number) => {
        newsContext += `${index + 1}. ${item.title}\n`;
        // Beschränke den Inhalt auf 200 Zeichen für einen kurzen Überblick
        const cleanContent =
          item.content.replace(/<[^>]+>/g, "").substring(0, 200) + "...";
        newsContext += `${cleanContent}\n\n`;
      });

      message = `Ich stelle dir eine Frage, aber bevor du antwortest, hier sind aktuelle Krypto-Nachrichten, die du in deine Antwort einbeziehen kannst, wenn relevant:\n\n${newsContext}\n\nMeine Frage ist: ${message}`;

      const result = await model.generateContent(message);
      return result.response.text();
    } else throw new Error("no data!");
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, I couldn't process that request. Please try again later.";
  }
};

export default getAiAnswers;
