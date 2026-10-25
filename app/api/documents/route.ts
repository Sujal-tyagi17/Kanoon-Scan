import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { encryptText } from "@/lib/encryption";
import { logAuditEvent } from "@/lib/db/audit";
import { Document } from "@/types/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, rawText, type } = await req.json();

    if (!name || !rawText) {
      return NextResponse.json(
        { error: "Name and text are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const documents = db.collection<Document>("documents");

    // Encrypt the document content before storing it in MongoDB
    const encryptedText = encryptText(rawText);

    // Create document
    const documentResult = await documents.insertOne({
      userId: user._id!.toString(),
      name,
      type: type || "TEXT",
      rawText: encryptedText,
      status: "PENDING",
      createdAt: new Date(),
    });

    const documentId = documentResult.insertedId.toString();

    // Log SOC 2 Audit Event
    await logAuditEvent(
      user._id!.toString(),
      "DOCUMENT_CREATED",
      `Document created and encrypted successfully. Document ID: ${documentId}`
    );

    return NextResponse.json({
      success: true,
      documentId,
    });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
