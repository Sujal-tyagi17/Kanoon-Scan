import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { ObjectId } from "mongodb";
import { getOrCreateDbUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { logAuditEvent } from "@/lib/db/audit";
import { Analysis, Document } from "@/types/db";

/** Turns the public read-only link for a report on or off (owner only). */
export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDbUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { analysisId, enabled } = await req.json();
    if (!analysisId || !ObjectId.isValid(analysisId) || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "analysisId and enabled are required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const analyses = db.collection<Analysis>("analyses");
    const analysis = await analyses.findOne({ _id: new ObjectId(analysisId) });
    const document =
      analysis && ObjectId.isValid(String(analysis.documentId))
        ? await db.collection<Document>("documents").findOne({ _id: new ObjectId(String(analysis.documentId)) })
        : null;
    if (!analysis || !document || document.userId !== user._id.toString()) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Keep the same token when re-enabling, so a link shared earlier works again
    const shareToken = analysis.shareToken || randomBytes(18).toString("base64url");
    await analyses.updateOne({ _id: analysis._id }, { $set: { shareToken, shareEnabled: enabled } });

    await logAuditEvent(
      user._id.toString(),
      enabled ? "REPORT_SHARE_ENABLED" : "REPORT_SHARE_DISABLED",
      `Public link ${enabled ? "enabled" : "disabled"} for analysis ${analysisId}`
    );

    return NextResponse.json({ shareEnabled: enabled, sharePath: `/share/${shareToken}` });
  } catch (error) {
    console.error("Error updating share link:", error);
    return NextResponse.json({ error: "Failed to update sharing" }, { status: 500 });
  }
}
