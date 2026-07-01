import { GoogleGenerativeAI } from "@google/generative-ai";
import { CHAT_PROMPT } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function chatWithDocument(
  documentSummary: string,
  clausesSummary: string,
  documentText: string,
  chatHistory: string,
  userQuestion: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = CHAT_PROMPT(
      documentSummary,
      clausesSummary,
      documentText,
      chatHistory,
      userQuestion
    );

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error("Error chatting with document:", error);
    throw new Error("Failed to get response. Please try again.");
  }
}
