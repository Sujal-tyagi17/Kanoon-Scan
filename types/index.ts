export type RiskLevel = "CRITICAL" | "WARNING" | "INFO" | "MISSING" | "SAFE";

export type RiskCategory =
  | "LIABILITY"
  | "TERMINATION"
  | "IP"
  | "PRIVACY"
  | "PAYMENT";

export type DocumentStatus = "PENDING" | "ANALYZING" | "COMPLETE" | "FAILED";

export interface ClauseType {
  id: string;
  title: string;
  originalText: string;
  riskLevel: RiskLevel;
  explanation: string;
  whyRisky: string;
  suggestion: string;
  commonality: number;
  category: RiskCategory;
  position: number;
  isSaved: boolean;
}

export interface CategoryType {
  name: string;
  score: number;
  level: string;
}

export interface AnalysisType {
  id: string;
  riskScore: number;
  riskLevel: string;
  summary: string;
  plainEnglish: string;
  clauses: ClauseType[];
  categories: CategoryType[];
  createdAt: string;
}

export interface DocumentType {
  id: string;
  name: string;
  type: string;
  status: DocumentStatus;
  createdAt: string;
  fileUrl?: string;
  analysis?: AnalysisType;
}

export interface ChatMessage {
  role: "USER" | "ASSISTANT";
  message: string;
  createdAt: string;
}

export interface GeminiAnalysisResponse {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summary: string;
  plainEnglish: string | string[];
  aiRecommendation: string;
  categories: CategoryType[];
  clauses: Omit<ClauseType, "id" | "isSaved">[];
  overallVerdict?: { status: string; explanation: string } | null;
  positiveClauses?: string[];
  keyInformation?: Record<string, string>;
  confidenceScore?: string | null;
}
