import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth";
import { consumeLimit, limitMessage, refundLimit } from "@/lib/rate-limit";
import { connectToDatabase } from "@/lib/db";
import { decryptText } from "@/lib/encryption";
import { chatWithDocument } from "@/lib/gemini/chat";
import { Analysis, Document, Clause, Chat } from "@/types/db";
import { ObjectId } from "mongodb";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { analysisId, message, saveToHistory = true } = await req.json();

    if (typeof message === "string" && message.length > 4000) {
      return NextResponse.json({ error: "Message is too long (max 4000 characters)." }, { status: 400 });
    }

    if (!analysisId || !ObjectId.isValid(analysisId) || !message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Analysis ID and message are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const analyses = db.collection<Analysis>("analyses");
    const documents = db.collection<Document>("documents");
    const clausesCol = db.collection<Clause>("clauses");
    const chatsCol = db.collection<Chat>("chats");


    // Get analysis
    const analysis = await analyses.findOne({ _id: new ObjectId(analysisId) });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Get related document
    const document = await documents.findOne({ _id: new ObjectId(analysis.documentId) });

    if (!document || document.userId !== dbUser._id!.toString()) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Fetch related clauses
    const clauses = await clausesCol.find({ analysisId }).toArray();

    // Fetch the LAST 10 chat messages for context (newest first, then back to chronological)
    const recentChats = (
      await chatsCol.find({ analysisId }).sort({ createdAt: -1 }).limit(10).toArray()
    ).reverse();

    // Build chat history
    const chatHistory = recentChats
      .map((chat: any) => `${chat.role}: ${chat.message}`)
      .join("\n");

    // Build clauses summary
    const clausesSummary = clauses
      .map((clause: any) => `- ${clause.title} [${clause.riskLevel}]: ${clause.explanation}`)
      .join("\n");

    // Decrypt the rawText (AES-256 decrypted in-memory only)
    const decryptedText = decryptText(document.rawText);

    const quota = await consumeLimit(dbUser._id.toString(), "chat");
    if (!quota.allowed) {
      return NextResponse.json({ error: limitMessage("chat", quota) }, { status: 429 });
    }

    // Get AI response
    let aiResponse: string;
    try {
      aiResponse = await chatWithDocument(analysis.summary, clausesSummary, decryptedText, chatHistory, message);
    } catch (aiError) {
      await refundLimit(dbUser._id.toString(), "chat");
      throw aiError;
    }

    // Save both messages to history (skipped for one-off requests like clause drafts)
    if (saveToHistory) {
      const now = Date.now();
      await chatsCol.insertMany([
        { analysisId, role: "USER", message, createdAt: new Date(now) },
        // +1ms keeps the pair in order when sorting by createdAt
        { analysisId, role: "ASSISTANT", message: aiResponse, createdAt: new Date(now + 1) },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: aiResponse,
    });
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
