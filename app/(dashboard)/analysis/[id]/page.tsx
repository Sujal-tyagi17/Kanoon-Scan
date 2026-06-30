import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { decryptText } from "@/lib/encryption";
import { User, Document, Analysis, Clause, RiskCategory } from "@/types/db";
import { ObjectId } from "mongodb";
import AnalysisReportClient from "./AnalysisReportClient";

export default async function AnalysisPage({ params }: { params: { id: string } }) {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const { db } = await connectToDatabase();
  const users = db.collection<User>("users");
  const analyses = db.collection<Analysis>("analyses");
  const documents = db.collection<Document>("documents");
  const clausesCol = db.collection<Clause>("clauses");
  const riskCategoriesCol = db.collection<RiskCategory>("riskCategories");

  // Fetch user
  const dbUser = await users.findOne({ clerkId: user.id });
  if (!dbUser) {
    redirect("/dashboard");
  }

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
  const document = await documents.findOne({ _id: new ObjectId(analysis.documentId) });
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
  }));

  const categories = await riskCategoriesCol.find({ analysisId }).toArray();
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
  };

  return <AnalysisReportClient analysisData={analysisData} />;
}
