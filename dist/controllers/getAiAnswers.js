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
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const RSS_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/";
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${RSS_URL}`;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
// Initialize Google Generative AI with your API key
const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const getAiAnswers = (message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(API_URL);
        const data = yield response.json();
        if (data && data.length != 0) {
            // Erstelle einen kurzen Überblick über die letzten 5 Nachrichten
            const recentNews = data.items ? data.items.slice(0, 5) : [];
            let newsContext = "Hier sind aktuelle Krypto-Nachrichten:\n\n";
            recentNews.forEach((item, index) => {
                newsContext += `${index + 1}. ${item.title}\n`;
                // Beschränke den Inhalt auf 100 Zeichen für einen kurzen Überblick
                const cleanContent = item.content.replace(/<[^>]+>/g, "").substring(0, 100) + "...";
                newsContext += `${cleanContent}\n\n`;
            });
            message = `Ich stelle dir eine Frage, aber bevor du antwortest, hier sind aktuelle Krypto-Nachrichten, die du in deine Antwort einbeziehen kannst, wenn relevant:\n\n${newsContext}\n\nMeine Frage ist: ${message}`;
            const result = yield model.generateContent(message);
            return result.response.text();
        }
        else
            throw new Error("no data!");
        // const newsContext = prepareNewsContext();
        // let fullPrompt = userPrompt;
        // Füge Nachrichtenkontext hinzu, wenn Nachrichten verfügbar sind
    }
    catch (error) {
        console.error("Error generating AI response:", error);
        return "Sorry, I couldn't process that request. Please try again later.";
    }
});
exports.default = getAiAnswers;
