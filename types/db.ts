export interface User {
  _id?: any;
  id?: string;
  clerkId: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface Document {
  _id?: any;
  id?: string;
  userId: any; // User._id
  name: string;
  type: string;
  fileUrl?: string | null;
  rawText: string; // Encrypted text in db
  status: string; // 'UPLOADING' | 'PROCESSING' | 'COMPLETE' | 'FAILED' | 'ERROR'
  createdAt: Date;
}

export interface Analysis {
  _id?: any;
  id?: string;
  documentId: any; // Document._id
  riskScore: number;
  riskLevel: string;
  summary: string;
  plainEnglish: string;
  createdAt: Date;
  overallVerdict?: { status: string; explanation: string } | null;
  positiveClauses?: string[];
  keyInformation?: Record<string, string>;
  confidenceScore?: string | null;
}

export interface Clause {
  _id?: any;
  id?: string;
  analysisId: any; // Analysis._id
  title: string;
  originalText: string;
  riskLevel: string;
  explanation: string;
  whyRisky: string;
  suggestion: string;
  commonality: number;
  category: string;
  position: number;
  isSaved: boolean;
  whoBenefits?: string;
  whoIsAtRisk?: string;
  severity?: string;
}

export interface RiskCategory {
  _id?: any;
  id?: string;
  analysisId: any; // Analysis._id
  name: string;
  score: number;
  level: string;
}

export interface Chat {
  _id?: any;
  id?: string;
  analysisId: any; // Analysis._id
  role: "USER" | "ASSISTANT";
  message: string;
  createdAt: Date;
}

export interface AuditLog {
  _id?: any;
  id?: string;
  userId: any;
  action: string;
  details: string;
  ipAddress?: string;
  createdAt: Date;
}
