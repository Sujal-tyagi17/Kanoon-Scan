import { connectToDatabase } from "@/lib/db";
import { Analysis, Document } from "@/types/db";

import type { DocStatus, DocumentListItem } from "@/lib/utils/documents-ui";

export type { DocStatus, DocumentListItem };

/** Normalises the various status strings stored over time ("complete", "COMPLETE", "ERROR", "FAILED", ...). */
export function normaliseStatus(raw: string | undefined, hasAnalysis: boolean): DocStatus {
  const s = (raw || "").toUpperCase();
  if (hasAnalysis || s === "COMPLETE" || s === "COMPLETED") return "Completed";
  if (s === "FAILED" || s === "ERROR") return "Failed";
  return "Processing";
}

/** Lists a user's documents with their analysis summary, using one query per collection (no N+1). */
export async function listUserDocuments(userId: string, limit?: number): Promise<DocumentListItem[]> {
  const { db } = await connectToDatabase();
  const documentsCol = db.collection<Document>("documents");
  const analysesCol = db.collection<Analysis>("analyses");

  let cursor = documentsCol
    .find({ userId }, { projection: { rawText: 0 } })
    .sort({ createdAt: -1 });
  if (limit) cursor = cursor.limit(limit);
  const docs = await cursor.toArray();

  const ids = docs.map((d) => d._id!.toString());
  const analyses = ids.length
    ? await analysesCol
        .find({ documentId: { $in: ids } }, { projection: { documentId: 1, riskLevel: 1, riskScore: 1 } })
        .toArray()
    : [];
  const byDoc = new Map(analyses.map((a) => [String(a.documentId), a]));

  return docs.map((doc) => {
    const id = doc._id!.toString();
    const analysis = byDoc.get(id);
    const status = normaliseStatus(doc.status, !!analysis);
    return {
      id,
      name: doc.name,
      dateAnalyzed: new Date(doc.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      riskLevel: analysis?.riskLevel ? String(analysis.riskLevel).toUpperCase() : null,
      riskScore: typeof analysis?.riskScore === "number" ? analysis.riskScore : null,
      status,
      analysisId: analysis?._id ? analysis._id.toString() : null,
      href: analysis
        ? `/analysis/${analysis._id.toString()}`
        : status === "Processing"
          ? `/scan/analyzing?documentId=${id}`
          : `/scan`,
    };
  });
}

