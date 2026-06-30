import { GoogleGenerativeAI } from "@google/generative-ai";
import { ANALYSIS_PROMPT } from "./prompts";
import type { GeminiAnalysisResponse } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeDocument(
  documentText: string
): Promise<GeminiAnalysisResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = ANALYSIS_PROMPT(documentText);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7);
    }
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }

    const parsedResponse = JSON.parse(cleanedText.trim());

    // Validate response structure
    if (
      !parsedResponse.riskScore ||
      !parsedResponse.riskLevel ||
      !parsedResponse.summary ||
      !parsedResponse.plainEnglish ||
      !parsedResponse.categories ||
      !parsedResponse.clauses
    ) {
      throw new Error("Invalid response structure from Gemini API");
    }

    return parsedResponse as GeminiAnalysisResponse;
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error("Failed to analyze document. Please try again.");
  }
}
