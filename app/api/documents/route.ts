import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { encryptText } from "@/lib/encryption";
import { logAuditEvent } from "@/lib/db/audit";
import { User, Document } from "@/types/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
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
    const users = db.collection<User>("users");
    const documents = db.collection<Document>("documents");

    // Find user by clerkId
    const user = await users.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
