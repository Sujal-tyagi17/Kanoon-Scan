import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { encryptText } from "@/lib/encryption";
import { logAuditEvent } from "@/lib/db/audit";
import { Document } from "@/types/db";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the pasted text
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (text.trim().length < 50) {
      return NextResponse.json(
        { error: "That text is too short to analyse. Paste at least a paragraph of the agreement." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const documents = db.collection<Document>("documents");

    // Encrypt the pasted text for secure zero-knowledge storage
    const encryptedText = encryptText(text);

    // Create document with the pasted text
    const documentResult = await documents.insertOne({
      userId: dbUser._id.toString(),
      name: "Pasted Text",
      type: "text/plain",
      fileUrl: "",
      rawText: encryptedText,
      status: "PROCESSING",
      createdAt: new Date(),
    });

    const documentId = documentResult.insertedId.toString();

    // Log SOC 2 Audit Event
    await logAuditEvent(
      dbUser._id.toString(),
      "PASTE_TEXT_UPLOAD",
      `Pasted text uploaded and encrypted successfully. Document ID: ${documentId}`
    );

    return NextResponse.json(
      { documentId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing pasted text:", error);
    return NextResponse.json(
      { error: "Failed to process text" },
      { status: 500 }
    );
  }
}
