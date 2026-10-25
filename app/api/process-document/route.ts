import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { encryptText } from "@/lib/encryption";
import { logAuditEvent } from "@/lib/db/audit";
import { User, Document } from "@/types/db";
import { ObjectId } from "mongodb";
import mammoth from "mammoth";

import { extractText, getDocumentProxy } from "unpdf";

// unpdf ships a serverless build of pdf.js (no worker file), which works on Vercel.
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: false });
    return (Array.isArray(text) ? text.join("\n\n") : String(text)).trim();
  } catch (error: any) {
    console.error("Error extracting PDF text:", error);
    if (error?.name === "PasswordException") {
      throw new Error("This PDF is password-protected. Remove the password and upload it again.");
    }
    throw new Error("Couldn't read this PDF. If it's a scanned image, paste the text instead.");
  }
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    console.error("Error extracting DOCX text:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let documentId: string | undefined;

  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read payload as multipart form-data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileType = file.type || "";
    const lowerName = fileName.toLowerCase();

    if (file.size > 16 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 16MB." },
        { status: 413 }
      );
    }

    const isPdf = fileType === "application/pdf" || lowerName.endsWith(".pdf");
    const isDocx =
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lowerName.endsWith(".docx");
    const isTxt = fileType.startsWith("text/") || lowerName.endsWith(".txt");

    if (!isPdf && !isDocx && !isTxt) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, DOCX or TXT file." },
        { status: 415 }
      );
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { db } = await connectToDatabase();
    const documents = db.collection<Document>("documents");

    const userObjectId = user._id.toString();

    // Create document record with PROCESSING status directly since upload is skipped
    const documentResult = await documents.insertOne({
      userId: userObjectId,
      name: fileName,
      type: fileType || "application/pdf",
      fileUrl: null, // No third-party Uploadthing URL needed
      rawText: "",
      status: "PROCESSING",
      createdAt: new Date(),
    });

    documentId = documentResult.insertedId.toString();

    // Extract text based on file type
    let extractedText = "";
    try {
      if (isPdf) {
        extractedText = await extractTextFromPDF(buffer);
      } else if (isDocx) {
        extractedText = await extractTextFromDOCX(buffer);
      } else {
        extractedText = buffer.toString("utf-8");
      }

      if (!extractedText.trim()) {
        throw new Error(
          "We couldn't find any text in this file. If it's a scanned PDF, try pasting the text instead."
        );
      }

      // Encrypt the extracted text for secure zero-knowledge storage
      const encryptedText = encryptText(extractedText);

      // Update document with encrypted text and complete the processing status
      await documents.updateOne(
        { _id: new ObjectId(documentId) },
        {
          $set: {
            rawText: encryptedText,
            status: "PROCESSING",
          },
        }
      );

      // Log SOC 2 Audit Event
      await logAuditEvent(
        userObjectId,
        "DOCUMENT_PARSING_COMPLETED",
        `Parsed and encrypted text from file ${fileName}. Document ID: ${documentId}`
      );

      return NextResponse.json({
        success: true,
        documentId: documentId,
        textLength: extractedText.length,
      });
    } catch (error) {
      // Update document status to ERROR if extraction fails
      await documents.updateOne(
        { _id: new ObjectId(documentId) },
        { $set: { status: "ERROR" } }
      );
      throw error;
    }
  } catch (error: any) {
    console.error("Error processing document:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process document" },
      { status: 500 }
    );
  }
}
