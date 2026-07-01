import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { encryptText } from "@/lib/encryption";
import { logAuditEvent } from "@/lib/db/audit";
import { User, Document } from "@/types/db";
import { ObjectId } from "mongodb";
import mammoth from "mammoth";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { pathToFileURL } from "url";

// Bind the legacy CJS worker directly to pdfjsLib instance to resolve Node.js mock tasks
if (typeof window === "undefined") {
  const absolutePath = require("path").join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs"
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(absolutePath).toString();
} else {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    
    let fullText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }
    return fullText.trim();
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Failed to extract text from PDF");
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

export async function POST(req: NextRequest) {
  let documentId: string | undefined;
  let userObjectId: string | undefined;
  
  try {
    const { userId } = auth();
    if (!userId) {
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
    const fileType = file.type;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { db } = await connectToDatabase();
    const users = db.collection<User>("users");
    const documents = db.collection<Document>("documents");

    // Get user from database
    const user = await users.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    userObjectId = user._id!.toString();

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
      if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        extractedText = await extractTextFromPDF(buffer);
      } else if (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".doc")
      ) {
        extractedText = await extractTextFromDOCX(buffer);
      } else if (fileType.startsWith("text/") || fileName.endsWith(".txt")) {
        extractedText = buffer.toString("utf-8");
      } else {
        throw new Error("Unsupported file type");
      }

      if (!extractedText.trim()) {
        throw new Error("Extracted text is empty");
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
