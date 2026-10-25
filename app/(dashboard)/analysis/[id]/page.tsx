import { redirect } from "next/navigation";
import { getOrCreateDbUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { decryptText } from "@/lib/encryption";
import { Document, Analysis, Clause, RiskCategory, Chat } from "@/types/db";
import { ObjectId } from "mongodb";
import AnalysisReportClient from "./AnalysisReportClient";

export const dynamic = "force-dynamic";

export default async function AnalysisPage({ params }: { params: { id: string } }) {
  const dbUser = await getOrCreateDbUser();
  if (!dbUser) {
    redirect("/sign-in");
  }

  const { db } = await connectToDatabase();
  const analyses = db.collection<Analysis>("analyses");
  const documents = db.collection<Document>("documents");
  const clausesCol = db.collection<Clause>("clauses");
  const riskCategoriesCol = db.collection<RiskCategory>("riskCategories");

  let analysis = null;

  // Try finding analysis by its ObjectID first
  if (ObjectId.isValid(params.id)) {
    analysis = await analyses.findOne({ _id: new ObjectId(params.id) });
  }

  // Fallback: check if the route parameter is the document ID
  if (!analysis) {
    analysis = await analyses.findOne({ documentId: params.id });
  }

  if (!analysis) {
    redirect("/dashboard");
  }

  const analysisId = analysis._id!.toString();

  // Fetch document
  const document = ObjectId.isValid(String(analysis.documentId))
    ? await documents.findOne({ _id: new ObjectId(String(analysis.documentId)) })
    : null;
  if (!document || document.userId !== dbUser._id!.toString()) {
    redirect("/dashboard");
  }

  // Decrypt rawText in-memory (Secure Zero-Knowledge Vault)
  const decryptedText = decryptText(document.rawText);

  // Format objects to align with frontend types
  const formattedDoc = {
    id: document._id!.toString(),
    userId: document.userId,
    name: document.name,
    type: document.type,
    fileUrl: document.fileUrl,
    rawText: decryptedText,
    status: document.status,
    createdAt: document.createdAt,
  };

  const clauses = await clausesCol.find({ analysisId })
    .sort({ position: 1 })
    .toArray();
  const formattedClauses = clauses.map(c => ({
    id: c._id!.toString(),
    analysisId: c.analysisId,
    title: c.title,
    originalText: c.originalText,
    riskLevel: c.riskLevel,
    explanation: c.explanation,
    whyRisky: c.whyRisky,
    suggestion: c.suggestion,
    commonality: c.commonality,
    category: c.category,
    position: c.position,
    isSaved: c.isSaved,
    // Dynamic fields (Feature 12)
    whoBenefits: (c as any).whoBenefits || "Not specified in the agreement.",
    whoIsAtRisk: (c as any).whoIsAtRisk || "Not specified in the agreement.",
    severity: (c as any).severity || c.riskLevel || "MEDIUM",
  }));

  const categories = await riskCategoriesCol.find({ analysisId }).toArray();
  const chatHistory = (
    await db.collection<Chat>("chats").find({ analysisId }).sort({ createdAt: -1 }).limit(50).toArray()
  )
    .reverse()
    .map((c) => ({ role: c.role, message: c.message }));
  const formattedCategories = categories.map(c => ({
    id: c._id!.toString(),
    analysisId: c.analysisId,
    name: c.name,
    score: c.score,
    level: c.level,
  }));

  const analysisData = {
    id: analysisId,
    documentId: analysis.documentId,
    riskScore: analysis.riskScore,
    riskLevel: analysis.riskLevel,
    summary: analysis.summary,
    plainEnglish: analysis.plainEnglish,
    createdAt: analysis.createdAt,
    document: formattedDoc,
    clauses: formattedClauses,
    categories: formattedCategories,
    // Features 1, 2, 3, 4 loader mappings (backward compatible with fallback defaults)
    overallVerdict: (analysis as any).overallVerdict || null,
    positiveClauses: Array.isArray((analysis as any).positiveClauses) ? (analysis as any).positiveClauses : [],
    keyInformation: (analysis as any).keyInformation || {},
    confidenceScore: (analysis as any).confidenceScore || null,
    shareToken: analysis.shareToken || null,
    shareEnabled: !!analysis.shareEnabled,
  };

  return <AnalysisReportClient analysisData={analysisData} initialChat={chatHistory} />;
}
