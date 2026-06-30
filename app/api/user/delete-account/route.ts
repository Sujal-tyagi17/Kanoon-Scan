import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { User, Document, Analysis, Clause, RiskCategory, Chat, AuditLog } from "@/types/db";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const users = db.collection<User>("users");
    const documents = db.collection<Document>("documents");
    const analyses = db.collection<Analysis>("analyses");
    const clauses = db.collection<Clause>("clauses");
    const riskCategories = db.collection<RiskCategory>("riskCategories");
    const chats = db.collection<Chat>("chats");
    const auditLogs = db.collection<AuditLog>("audit_logs");

    // Find user record in MongoDB
    const user = await users.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userObjectId = user._id!.toString();

    // 1. Get all document IDs for this user
    const userDocs = await documents.find({ userId: userObjectId }, { projection: { _id: 1 } }).toArray();
    const userDocIds = userDocs.map((doc) => doc._id.toString());

    // 2. Get all analysis IDs corresponding to those documents
    const userAnalysesDocs = await analyses.find({ documentId: { $in: userDocIds } }, { projection: { _id: 1 } }).toArray();
    const userAnalysesIds = userAnalysesDocs.map((ana) => ana._id.toString());

    // 3. Delete all clauses, risk categories, and chats associated with these analyses
    if (userAnalysesIds.length > 0) {
      await clauses.deleteMany({ analysisId: { $in: userAnalysesIds } });
      await riskCategories.deleteMany({ analysisId: { $in: userAnalysesIds } });
      await chats.deleteMany({ analysisId: { $in: userAnalysesIds } });
    }

    // 4. Delete all analyses
    if (userDocIds.length > 0) {
      await analyses.deleteMany({ documentId: { $in: userDocIds } });
    }

    // 5. Delete all documents
    await documents.deleteMany({ userId: userObjectId });

    // 6. Delete all audit logs
    await auditLogs.deleteMany({ userId: userObjectId });

    // 7. Delete user profile record
    await users.deleteOne({ _id: user._id });

    return NextResponse.json({
      success: true,
      message: "All account records have been permanently purged (GDPR Right to Erasure compliant).",
    });
  } catch (error) {
    console.error("GDPR account deletion failure:", error);
    return NextResponse.json(
      { error: "Failed to purge account data" },
      { status: 500 }
    );
  }
}
