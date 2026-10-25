import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { CHAT_PROMPT } from "./prompts";

const GEMINI_CHAT_MODELS = (process.env.GEMINI_MODELS || "gemini-2.5-flash,gemini-2.5-flash-lite").split(",").map((m) => m.trim()).filter(Boolean);
const GROQ_CHAT_MODELS = (process.env.GROQ_MODELS || "llama-3.3-70b-versatile,llama-3.1-8b-instant").split(",").map((m) => m.trim()).filter(Boolean);

/** Answers a question about a document. Tries Gemini first (large context), then Groq. */
export async function chatWithDocument(
  documentSummary: string,
  clausesSummary: string,
  documentText: string,
  chatHistory: string,
  userQuestion: string
): Promise<string> {
  const failures: string[] = [];

  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const prompt = CHAT_PROMPT(documentSummary, clausesSummary, documentText.slice(0, 400_000), chatHistory, userQuestion);
    for (const name of GEMINI_CHAT_MODELS) {
      try {
        const result = await genAI.getGenerativeModel({ model: name }).generateContent(prompt);
        const text = result.response.text().trim();
        if (text) return text;
        throw new Error("empty response");
      } catch (e: any) {
        failures.push(`gemini:${name}: ${String(e?.message || e).slice(0, 150)}`);
      }
    }
  }

  if (process.env.GROQ_API_KEY) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, maxRetries: 0, timeout: 30_000 });
    // Groq free tier has small token limits, so send a trimmed document
    const prompt = CHAT_PROMPT(documentSummary, clausesSummary, documentText.slice(0, 15_000), chatHistory, userQuestion);
    for (const name of GROQ_CHAT_MODELS) {
      try {
        const res = await groq.chat.completions.create({
          model: name,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 800,
        });
        const text = res.choices[0]?.message?.content?.trim();
        if (text) return text;
        throw new Error("empty response");
      } catch (e: any) {
        failures.push(`groq:${name}: ${String(e?.message || e).slice(0, 150)}`);
      }
    }
  }

  console.error("Chat failed on all models:\n" + failures.join("\n"));
  throw new Error("Failed to get response. Please try again.");
}
