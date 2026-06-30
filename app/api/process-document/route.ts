import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { encryptText } from "@/lib/encryption";
import { logAuditEvent } from "@/lib/db/audit";
import { User, Document } from "@/types/db";
import { ObjectId } from "mongodb";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function extractTextFromPDF(fileUrl: string): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument(fileUrl);
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

async function extractTextFromDOCX(fileUrl: string): Promise<string> {
  try {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
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

    const { fileUrl, fileName, fileType } = await req.json();

    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { error: "File URL and name are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const users = db.collection<User>("users");
    const documents = db.collection<Document>("documents");

    // Get user from database
    const user = await users.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    userObjectId = user._id!.toString();

    // Create document record with UPLOADING status
    const documentResult = await documents.insertOne({
      userId: userObjectId,
      name: fileName,
      type: fileType || "application/pdf",
      fileUrl: fileUrl,
      rawText: "",
      status: "UPLOADING",
      createdAt: new Date(),
    });

    documentId = documentResult.insertedId.toString();

    // Extract text based on file type
    let extractedText = "";
    
    try {
      if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        extractedText = await extractTextFromPDF(fileUrl);
      } else if (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx")
      ) {
        extractedText = await extractTextFromDOCX(fileUrl);
      } else {
        throw new Error("Unsupported file type");
      }

      // Encrypt the extracted text for secure zero-knowledge storage
      const encryptedText = encryptText(extractedText);

      // Update document with encrypted text and status
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
  } catch (error) {
    console.error("Error processing document:", error);
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    );
  }
}
