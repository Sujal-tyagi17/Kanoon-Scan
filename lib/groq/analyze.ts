import Groq from "groq-sdk";
import type { GeminiAnalysisResponse } from "@/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function analyzeDocument(
  documentText: string
): Promise<GeminiAnalysisResponse> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: ANALYSIS_PROMPT(documentText),
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";

    if (!responseText) {
      throw new Error("Empty response from Groq API");
    }

    // Remove markdown code blocks if present
    let cleanedText = responseText.trim();
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

    // Validate response structure (loose check, rely on fallbacks in route.ts)
    if (typeof parsedResponse !== "object" || parsedResponse === null) {
      throw new Error("Invalid response structure from Groq API");
    }
    
    // Ensure arrays exist so .map() doesn't crash later
    parsedResponse.categories = Array.isArray(parsedResponse.categories) ? parsedResponse.categories : [];
    parsedResponse.clauses = Array.isArray(parsedResponse.clauses) ? parsedResponse.clauses : [];

    return parsedResponse as GeminiAnalysisResponse;
  } catch (error) {
    console.error("Error analyzing document with Groq:", error);
    throw new Error("Failed to analyze document. Please try again.");
  }
}

function ANALYSIS_PROMPT(documentText: string): string {
  return `You are a legal document analyzer specialized in identifying potential risks and problematic clauses in contracts and agreements.

Analyze the following document and provide a comprehensive risk assessment in JSON format.

Document Text:
${documentText}

Provide your analysis in the following JSON structure:
{
  "riskScore": <number between 0-100>,
  "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<brief summary of the document>",
  "plainEnglish": "<explain the document in simple terms>",
  "categories": [
    {
      "name": "<category name>",
      "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
      "issues": ["<list of issues>"]
    }
  ],
  "clauses": [
    {
      "title": "<short descriptive title of the clause>",
      "originalText": "<exact text of the clause>",
      "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
      "explanation": "<what this means>",
      "whyRisky": "<why this clause is risky to the user>",
      "suggestion": "<recommendation on how to mitigate the risk>",
      "commonality": <number 1-10 on how common this clause is>,
      "category": "<the category this belongs to>"
    }
  ]
}

Focus on identifying:
- Unfair terms and conditions
- Hidden fees or charges
- Liability limitations
- Termination clauses
- Data privacy concerns
- Intellectual property rights
- Dispute resolution mechanisms
- Unclear or ambiguous language

Return ONLY valid JSON, no additional text.`;
}