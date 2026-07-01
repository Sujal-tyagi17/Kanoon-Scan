import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { logAuditEvent } from "@/lib/db/audit";
import { User, Document } from "@/types/db";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await req.json();
    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const users = db.collection<User>("users");
    const documents = db.collection<Document>("documents");
    const analyses = db.collection("analyses");
    const clauses = db.collection("clauses");
    const riskCategories = db.collection("riskCategories");

    // 1. Verify user exists
    const user = await users.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Verify document ownership
    const docObjectId = new ObjectId(documentId);
    const document = await documents.findOne({ _id: docObjectId });
    if (!document || document.userId !== user._id!.toString()) {
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      );
    }

    // 3. Find analysis record associated with this document
    const analysis = await analyses.findOne({ documentId: documentId });

    // 4. Delete associated children (clauses & riskCategories) if analysis exists
    if (analysis) {
      const analysisId = analysis._id.toString();
      await clauses.deleteMany({ analysisId });
      await riskCategories.deleteMany({ analysisId });
    }

    // 5. Delete analysis itself
    await analyses.deleteOne({ documentId: documentId });

    // 6. Delete document itself
    await documents.deleteOne({ _id: docObjectId });

    // 7. Log SOC 2 Audit Event
    await logAuditEvent(
      user._id!.toString(),
      "DOCUMENT_PURGED",
      `Document and all associated analysis, clauses, and risk categories deleted. Document ID: ${documentId}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
