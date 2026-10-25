import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Analysis, Clause, Document } from "@/types/db";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clauseId, isSaved } = await req.json();
    if (!clauseId || !ObjectId.isValid(clauseId)) {
      return NextResponse.json({ error: "A valid clause ID is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const clausesCol = db.collection<Clause>("clauses");
    const analysesCol = db.collection<Analysis>("analyses");
    const documentsCol = db.collection<Document>("documents");

    // Ownership check: clause -> analysis -> document -> user
    const clause = await clausesCol.findOne({ _id: new ObjectId(clauseId) });
    if (!clause || !ObjectId.isValid(String(clause.analysisId))) {
      return NextResponse.json({ error: "Clause not found" }, { status: 404 });
    }
    const analysis = await analysesCol.findOne({ _id: new ObjectId(String(clause.analysisId)) });
    const document = analysis && ObjectId.isValid(String(analysis.documentId))
      ? await documentsCol.findOne({ _id: new ObjectId(String(analysis.documentId)) })
      : null;
    if (!document || document.userId !== user._id.toString()) {
      return NextResponse.json({ error: "Clause not found" }, { status: 404 });
    }

    await clausesCol.updateOne(
      { _id: clause._id },
      { $set: { isSaved: !!isSaved } }
    );

    return NextResponse.json({ success: true, isSaved: !!isSaved });
  } catch (error) {
    console.error("Error updating clause saved status:", error);
    return NextResponse.json({ error: "Failed to update clause" }, { status: 500 });
  }
}
