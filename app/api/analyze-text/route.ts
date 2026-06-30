import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { encryptText } from "@/lib/encryption";
import { logAuditEvent } from "@/lib/db/audit";
import { User, Document } from "@/types/db";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await currentUser();
    if (!user) {
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

    const { db } = await connectToDatabase();
    const users = db.collection<User>("users");
    const documents = db.collection<Document>("documents");

    // Find or create user in database
    let dbUser = await users.findOne({ clerkId: user.id });

    if (!dbUser) {
      const insertResult = await users.insertOne({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
        createdAt: new Date(),
      });
      dbUser = {
        _id: insertResult.insertedId,
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
        createdAt: new Date(),
      };
    }

    // Encrypt the pasted text for secure zero-knowledge storage
    const encryptedText = encryptText(text);

    // Create document with the pasted text
    const documentResult = await documents.insertOne({
      userId: dbUser!._id!.toString(),
      name: `Pasted Text - ${new Date().toLocaleDateString()}`,
      type: "text/plain",
      fileUrl: "",
      rawText: encryptedText,
      status: "PROCESSING",
      createdAt: new Date(),
    });

    const documentId = documentResult.insertedId.toString();

    // Log SOC 2 Audit Event
    await logAuditEvent(
      dbUser!._id!.toString(),
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
