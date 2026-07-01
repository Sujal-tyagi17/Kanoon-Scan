import Groq from "groq-sdk";
import type { GeminiAnalysisResponse } from "@/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function analyzeDocument(
  documentText: string
): Promise<GeminiAnalysisResponse> {
  let chatCompletion;
  let useGeminiFallback = false;

  try {
    chatCompletion = await groq.chat.completions.create({
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
  } catch (primaryError: any) {
    const isRateLimit = primaryError?.status === 429 || 
                        (primaryError?.message && primaryError.message.toLowerCase().includes("rate_limit"));
                        
    if (isRateLimit) {
      console.warn("Llama-3.3 rate limit hit. Trying fallback model llama-3.1-8b-instant...");
      try {
        chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "user",
              content: ANALYSIS_PROMPT(documentText),
            },
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.3,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        });
      } catch (fallbackError) {
        console.warn("Error with fallback model llama-3.1-8b-instant. Trying mixtral-8x7b-32768...");
        try {
          chatCompletion = await groq.chat.completions.create({
            messages: [
              {
                role: "user",
                content: ANALYSIS_PROMPT(documentText),
              },
            ],
            model: "mixtral-8x7b-32768",
            temperature: 0.3,
            max_tokens: 4000,
            response_format: { type: "json_object" },
          });
        } catch (tertiaryError) {
          console.warn("All Groq models exhausted. Activating direct Google Gemini API Failover...");
          useGeminiFallback = true;
        }
      }
    } else {
      console.warn("Groq request failed with non-rate-limit error. Activating direct Google Gemini API Failover...");
      useGeminiFallback = true;
    }
  }

  // Google Gemini API Failover Implementation
  if (useGeminiFallback) {
    try {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
      }

      console.info("Executing contract analysis with Google Gemini (gemini-1.5-flash)...");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: ANALYSIS_PROMPT(documentText),
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API responded with status ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      const rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!rawText) {
        throw new Error("Empty text returned from Gemini API");
      }

      const parsedResponse = JSON.parse(rawText.trim());
      parsedResponse.categories = Array.isArray(parsedResponse.categories) ? parsedResponse.categories : [];
      parsedResponse.clauses = Array.isArray(parsedResponse.clauses) ? parsedResponse.clauses : [];
      return parsedResponse as GeminiAnalysisResponse;
    } catch (geminiError) {
      console.error("Critical: Google Gemini failover also failed:", geminiError);
      throw new Error("AI analysis engines are currently rate-limited. Please try again later.");
    }
  }

  try {
    if (!chatCompletion) {
      throw new Error("Groq API completion returned undefined");
    }
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
  return `You are a professional legal contract analyzer specialized in objective risk scoring, metadata extraction, and actionable, balanced legal advice.

Analyze the following document and provide a comprehensive risk assessment in JSON format.

Document Text:
${documentText}

=== CRITICAL RULE: NO HALLUCINATIONS & CLAUSE VALIDATION ===
1. NEVER invent, fabricate, or hallucinate clauses. If a clause or its subject matter does not explicitly exist in the document text, do NOT generate or report it.
2. For every clause you analyze, you must verify:
   - Does this clause actually appear in the document? If NO, skip it completely.
   - The "originalText" MUST contain the exact text extracted from the document. Do not summarize or invent text. If you cannot find the original text in the document, do not display or report the clause.
   - The explanation and recommendation must reference the actual wording of the clause.

=== COMMERCIAL RISK SCORING RULES ===
1. Standard Commercial Clauses vs. Unfair Clauses:
   Distinguish between standard business terms and unfair/unbalanced terms. Commercially normal clauses should be rated LOW risk and add 0 to 5 points. Do not classify them as Medium Risk.
   Examples of LOW Risk standard terms:
   - Payment within 15–30 days.
   - Annual late payment interest <=8% after a grace period.
   - 30-day cure period.
   - 12-month warranty.
   - Product replacement.
   - Return policies.
   - Governing law defined.
   - Mutual termination.
   - Written amendments.
   - Good-faith negotiation.
   - Arbitration by mutual agreement.
   - Reasonable confidentiality period (1-3 years).
   - Balanced notice periods.
   - Industry-standard limitation of liability.

2. Risk Ranges:
   - LOW RISK: adds 0-5 points.
   - MEDIUM RISK: adds 10-15 points (e.g. late payment interest >12%, auto renewal, no refund, one-sided termination, broad confidentiality, high penalties).
   - HIGH RISK: adds 20-25 points (e.g. unlimited liability, foreign jurisdiction, automatic price increases, no warranty, reverse engineering bans, broad IP assignment).
   - CRITICAL RISK: adds 30+ points (e.g. unlimited indemnification, automatic IP transfer, founder share lock, investor majority control, forced buyback, voting rights transfer).

3. Overall Risk Score Calculation:
   Overall Risk = (Sum of Negative Clause Scores) MINUS (Sum of Positive Clause Scores).
   - Cap the final overall risk score between 0 and 100.
   - If NO HIGH or CRITICAL risk clauses exist, the final overall score should rarely exceed 30.
   - A balanced standard commercial agreement should score around 20-25/100, resulting in "🟢 Safe to Sign".

=== POSITIVE CLAUSES DETECTION ===
Actively detect positive/balanced clauses that benefit the user or both parties (e.g. 'Warranty', 'Return Policy', 'Good Faith Negotiation', 'Mutual Termination', 'Governing Law', 'Defined Payment Schedule', 'Delivery Timeline'). List these in the "positiveClauses" array to offset risk scores.

=== OVERALL VERDICT SYSTEM ===
- riskScore < 25: status = "🟢 Safe to Sign"
- riskScore 25-50: status = "🟡 Review Before Signing"
- riskScore 50-75: status = "🟠 Legal Review Recommended"
- riskScore > 75: status = "🔴 Seek Legal Advice"

=== RECOMMENDATION ENGINE ===
Suggestions must match the risk level:
- LOW: "No significant legal concern detected." or "This clause follows common commercial practice."
- MEDIUM: "Consider negotiating..."
- HIGH: "Legal review recommended..."
- CRITICAL: "Strongly negotiate this clause before signing."

Provide your analysis in the following JSON structure:
{
  "riskScore": <final risk score between 0-100 calculated using (Negative Scores - Positive Scores) rules above>,
  "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<brief summary of the document>",
  "plainEnglish": "<detailed explanation in 3 to 6 paragraphs explaining purpose, parties, money, obligations, exit conditions. Do not use legal jargon>",
  "overallVerdict": {
    "status": "<🟢 Safe to Sign|🟡 Review Before Signing|🟠 Legal Review Recommended|🔴 Seek Legal Advice>",
    "explanation": "<contextual summary explaining the verdict choice based on risk score, detected clauses, and balance>"
  },
  "positiveClauses": [
    "<list balanced or protective clauses actually detected, e.g. 'Warranty', 'Mutual Termination'. Return empty array if none>"
  ],
  "keyInformation": {
    "<structured property key matching only present fields from: Agreement Type, Document Category, Parties, Agreement Date, Effective Date, Expiration Date, Jurisdiction, Governing Law, Contract Duration, Confidentiality Period, Notice Period, Termination Period, Salary, Rent, Security Deposit, Interest Rate, Vendor, Client, Employer, Employee, Tenant, Landlord, Renewal, Auto Renewal>": "<extracted value or 'Not specified in the agreement.'>"
  },
  "confidenceScore": "<percentage string like '98%' depending on document class: Very Simple (98-99%), Employment (96-98%), Rental (95-97%), Vendor (94-97%), Investor (92-95%). Reduce by 2-5% for ambiguous clauses>",
  "categories": [
    {
      "name": "<category name>",
      "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
      "issues": ["<list of issues>"]
    }
  ],
  "clauses": [
    {
      "title": "<short descriptive title of the clause actually present in the text>",
      "originalText": "<exact text of the clause as it appears in the document. NEVER summarize or make it up>",
      "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
      "explanation": "<what this means in plain English>",
      "whyRisky": "<why this clause is risky to the user, explaining matters, benefits, financial and legal impacts>",
      "suggestion": "<actionable severity-matched suggestion based on the Recommendation Engine rules above>",
      "commonality": <number 1-10 on commonality>,
      "category": "<the category this belongs to>",
      "whoBenefits": "<who benefits from this clause>",
      "whoIsAtRisk": "<who is at risk from this clause>",
      "severity": "<MINOR|MEDIUM|HIGH|CRITICAL>"
    }
  ]
}

Return ONLY valid JSON, no additional markdown wrapper.`;
}