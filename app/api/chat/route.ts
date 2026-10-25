import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { decryptText } from "@/lib/encryption";
import { chatWithDocument } from "@/lib/gemini/chat";
import { Analysis, Document, Clause, Chat } from "@/types/db";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { analysisId, message } = await req.json();

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

    // Fetch last 10 chat messages for context
    const recentChats = await chatsCol.find({ analysisId })
      .sort({ createdAt: 1 })
      .limit(10)
      .toArray();

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

    // Get AI response
    const aiResponse = await chatWithDocument(
      analysis.summary,
      clausesSummary,
      decryptedText,
      chatHistory,
      message
    );

    // Save both messages to database
    await chatsCol.insertMany([
      {
        analysisId: analysisId,
        role: "USER",
        message: message,
        createdAt: new Date(),
      },
      {
        analysisId: analysisId,
        role: "ASSISTANT",
        message: aiResponse,
        createdAt: new Date(),
      },
    ]);

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
