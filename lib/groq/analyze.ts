import Groq from "groq-sdk";
import type { GeminiAnalysisResponse } from "@/types";

/**
 * Contract analysis with a provider fallback chain.
 *
 * Each model is tried in order; ANY failure (rate limit, request too large,
 * model retired, bad JSON...) moves on to the next one. Model names can be
 * overridden with env vars so a retired model never needs a code change:
 *   GROQ_MODELS   = comma-separated Groq model ids
 *   GEMINI_MODELS = comma-separated Gemini model ids
 */

const DEFAULT_GROQ_MODELS = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "llama-3.1-8b-instant"];
const DEFAULT_GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

// Groq's free tier has small per-minute token limits, so very long documents
// go to Gemini (large context window) first.
const GROQ_MAX_CHARS = 20_000;
const GEMINI_MAX_CHARS = 400_000;

let groqClient: Groq | null = null;
function getGroq() {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY, maxRetries: 0, timeout: 45_000 });
  return groqClient;
}

function modelList(envVar: string, defaults: string[]) {
  const raw = process.env[envVar];
  const list = raw ? raw.split(",").map((m) => m.trim()).filter(Boolean) : [];
  return list.length ? list : defaults;
}

/** Maps the model's occasional custom labels (MINOR, SEVERE, MODERATE...) onto our four levels. */
function normaliseLevel(level: unknown): string {
  const l = String(level || "").trim().toUpperCase();
  if (["CRITICAL", "SEVERE", "VERY HIGH", "EXTREME"].includes(l)) return "CRITICAL";
  if (["HIGH", "MAJOR"].includes(l)) return "HIGH";
  if (["MEDIUM", "MODERATE", "CAUTION", "WARNING"].includes(l)) return "MEDIUM";
  if (["LOW", "MINOR", "NONE", "SAFE", "INFO", "MINIMAL"].includes(l)) return "LOW";
  return "MEDIUM";
}

function parseModelJson(raw: string): GeminiAnalysisResponse {
  let text = raw.trim();
  // Strip markdown fences if the model added them
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  // If there's leading/trailing chatter, cut to the outermost JSON object
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start > 0 || (end !== -1 && end < text.length - 1)) text = text.slice(start, end + 1);

  const parsed = JSON.parse(text);
  if (typeof parsed !== "object" || parsed === null) throw new Error("Response was not a JSON object");
  if (typeof parsed.riskScore === "string") parsed.riskScore = Number(parsed.riskScore);
  parsed.categories = Array.isArray(parsed.categories) ? parsed.categories : [];
  parsed.clauses = Array.isArray(parsed.clauses) ? parsed.clauses : [];
  parsed.riskLevel = normaliseLevel(parsed.riskLevel);
  for (const c of parsed.clauses) {
    c.riskLevel = normaliseLevel(c.riskLevel);
    c.severity = normaliseLevel(c.severity || c.riskLevel);
  }
  for (const c of parsed.categories) {
    if (c.riskLevel) c.riskLevel = normaliseLevel(c.riskLevel);
    if (c.level) c.level = normaliseLevel(c.level);
  }
  if (!parsed.summary && parsed.clauses.length === 0) throw new Error("Response had no summary or clauses");
  return parsed as GeminiAnalysisResponse;
}

async function tryGroq(model: string, documentText: string) {
  const completion = await getGroq().chat.completions.create({
    model,
    messages: [{ role: "user", content: ANALYSIS_PROMPT(documentText.slice(0, GROQ_MAX_CHARS)) }],
    temperature: 0.3,
    max_tokens: 8000,
    response_format: { type: "json_object" },
  });
  const content = completion.choices[0]?.message?.content || "";
  if (!content) throw new Error("empty response");
  return parseModelJson(content);
}

async function tryGemini(model: string, documentText: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Key in a header, not the URL, so it never shows up in logs
        "x-goog-api-key": process.env.GEMINI_API_KEY || "",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: ANALYSIS_PROMPT(documentText.slice(0, GEMINI_MAX_CHARS)) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3, maxOutputTokens: 16384 },
      }),
      signal: AbortSignal.timeout(50_000),
    }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || "").join("");
  if (!text) throw new Error(`empty response (finishReason: ${data.candidates?.[0]?.finishReason || "unknown"})`);
  return parseModelJson(text);
}

function describe(err: any) {
  const status = err?.status ? `HTTP ${err.status} ` : "";
  return `${status}${String(err?.message || err).slice(0, 200)}`;
}

export async function analyzeDocument(documentText: string): Promise<GeminiAnalysisResponse> {
  const attempts: { label: string; run: () => Promise<GeminiAnalysisResponse> }[] = [];

  const groq = process.env.GROQ_API_KEY
    ? modelList("GROQ_MODELS", DEFAULT_GROQ_MODELS).map((m) => ({ label: `groq:${m}`, run: () => tryGroq(m, documentText) }))
    : [];
  const gemini = process.env.GEMINI_API_KEY
    ? modelList("GEMINI_MODELS", DEFAULT_GEMINI_MODELS).map((m) => ({ label: `gemini:${m}`, run: () => tryGemini(m, documentText) }))
    : [];

  if (documentText.length > GROQ_MAX_CHARS) attempts.push(...gemini, ...groq);
  else attempts.push(...groq, ...gemini);

  if (attempts.length === 0) {
    throw new Error("No AI provider is configured. Set GROQ_API_KEY and/or GEMINI_API_KEY.");
  }

  const failures: string[] = [];
  for (const attempt of attempts) {
    try {
      const result = await attempt.run();
      console.info(`Contract analysis succeeded with ${attempt.label}`);
      return result;
    } catch (err) {
      const msg = `${attempt.label} failed: ${describe(err)}`;
      console.warn(msg);
      failures.push(msg);
    }
  }

  console.error("All AI providers failed:\n" + failures.join("\n"));
  const err = new Error("All AI models failed to analyse this document.");
  (err as any).details = failures;
  throw err;
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
      "severity": "<LOW|MEDIUM|HIGH|CRITICAL>"
    }
  ]
}

=== CLAUSE COVERAGE (MANDATORY) ===
1. The "clauses" array MUST contain EVERY clause in the document whose risk is MEDIUM, HIGH or CRITICAL. Never stop early and never omit one — go through the document from start to end before finishing.
2. If a numbered section contains several sub-clauses with different risks (e.g. 9.1 is fair but 9.2 and 9.3 are one-sided), report the risky sub-clauses as separate entries.
3. LOW-risk clauses are optional: include at most 4 of the most relevant ones, after all the risky ones.
4. Order the array by risk: CRITICAL first, then HIGH, then MEDIUM, then LOW.
5. Keep "originalText" to the exact sentence(s) that create the risk (under ~400 characters), so the full list fits in the response.
6. Every risk category you list in "categories" with HIGH or CRITICAL level must be backed by at least one entry in "clauses".
7. "riskLevel" and "severity" must use only LOW, MEDIUM, HIGH or CRITICAL.

Return ONLY valid JSON, no additional markdown wrapper.`;
}