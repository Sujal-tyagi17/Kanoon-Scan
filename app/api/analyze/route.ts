import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { decryptText } from "@/lib/encryption";
import { logAuditEvent } from "@/lib/db/audit";
import { analyzeDocument } from "@/lib/groq/analyze";
import { User, Document, Analysis, Clause, RiskCategory } from "@/types/db";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  let documentId: string | undefined;
  
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    documentId = body.documentId;

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const users = db.collection<User>("users");
    const documents = db.collection<Document>("documents");
    const analyses = db.collection<Analysis>("analyses");
    const clauses = db.collection<Clause>("clauses");
    const riskCategories = db.collection<RiskCategory>("riskCategories");

    const dbUser = await users.findOne({ clerkId: user.id });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const document = await documents.findOne({ _id: new ObjectId(documentId) });

    if (!document || document.userId !== dbUser._id!.toString()) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if analysis already exists
    const existingAnalysis = await analyses.findOne({ documentId: document._id!.toString() });
    if (existingAnalysis) {
      return NextResponse.json({
        success: true,
        analysisId: existingAnalysis._id!.toString(),
        data: existingAnalysis,
      });
    }

    // Set document status to ANALYZING
    await documents.updateOne(
      { _id: new ObjectId(documentId) },
      { $set: { status: "ANALYZING" } }
    );

    // Decrypt the rawText (AES-256 decrypted in-memory only)
    const decryptedText = decryptText(document.rawText);

    // Run the LLM AI Analysis (Smart Scanning, Risk Mitigation, Clause Detection, Metadata Extraction)
    const analysisResult = await analyzeDocument(decryptedText);

    const plainEnglishText = typeof analysisResult.plainEnglish === 'string' 
      ? analysisResult.plainEnglish 
      : Array.isArray(analysisResult.plainEnglish) 
        ? analysisResult.plainEnglish.join("\n") 
        : '';

    // Insert Analysis Document (handle race condition with duplicate key)
    let analysisId: string;
    try {
      const analysisInsertResult = await analyses.insertOne({
        documentId: document._id!.toString(),
        riskScore: (typeof analysisResult.riskScore === 'number' && !isNaN(analysisResult.riskScore)) ? analysisResult.riskScore : 50,
        riskLevel: analysisResult.riskLevel || 'MEDIUM',
        summary: analysisResult.summary || 'Summary unavailable.',
        plainEnglish: plainEnglishText || 'Plain English explanation unavailable.',
        createdAt: new Date(),
        // New Extended Legal AI fields (Feature 1, 2, 3, 4) saved backward-compatibly
        overallVerdict: analysisResult.overallVerdict || null,
        positiveClauses: Array.isArray(analysisResult.positiveClauses) ? analysisResult.positiveClauses : [],
        keyInformation: analysisResult.keyInformation || {},
        confidenceScore: analysisResult.confidenceScore || null,
      });
      analysisId = analysisInsertResult.insertedId.toString();
    } catch (insertError: any) {
      // E11000 = duplicate key — another request already created the analysis
      if (insertError.code === 11000) {
        const existing = await analyses.findOne({ documentId: document._id!.toString() });
        if (existing) {
          return NextResponse.json({
            success: true,
            analysisId: existing._id!.toString(),
          });
        }
      }
      throw insertError;
    }

    // Insert Clauses (AI Clause Detection & Risk Suggestions)
    if (analysisResult.clauses && analysisResult.clauses.length > 0) {
      const clausesData = analysisResult.clauses.map((clause: any, index: number) => ({
        analysisId,
        title: String(clause.title || `Clause ${index + 1}`).substring(0, 200),
        originalText: String(clause.text || clause.originalText || "No text provided."),
        explanation: String(clause.explanation || "No explanation provided."),
        riskLevel: String(clause.riskLevel || "MEDIUM").substring(0, 50),
        whyRisky: String(clause.whyRisky || "Not detailed."),
        suggestion: String(clause.recommendation || clause.suggestion || "Review carefully."),
        commonality: typeof clause.commonality === "number" ? clause.commonality : 5,
        category: String(clause.category || "General").substring(0, 100),
        position: index,
        isSaved: false,
        // Expanded legal intelligence attributes (Feature 12)
        whoBenefits: String(clause.whoBenefits || "Not specified in the agreement.").substring(0, 100),
        whoIsAtRisk: String(clause.whoIsAtRisk || "Not specified in the agreement.").substring(0, 100),
        severity: String(clause.severity || clause.riskLevel || "MEDIUM").substring(0, 50),
      }));
      await clauses.insertMany(clausesData);
    }

    // Insert Risk Categories
    if (analysisResult.categories && analysisResult.categories.length > 0) {
      const categoriesData = analysisResult.categories.map((cat: any) => {
        const level = String(cat.riskLevel || cat.level || "MEDIUM").substring(0, 50);
        return {
          analysisId,
          name: String(cat.name || "General").substring(0, 200),
          score: Math.round((level === 'CRITICAL' ? 90 : level === 'HIGH' ? 70 : level === 'MEDIUM' ? 50 : 20)),
          level: level,
        };
      });
      await riskCategories.insertMany(categoriesData);
    }

    // Set document status to COMPLETE
    await documents.updateOne(
      { _id: new ObjectId(documentId) },
      { $set: { status: "complete" } } // 'completed' is matched by page lists
    );

    // Log SOC 2 Audit Event
    await logAuditEvent(
      dbUser._id!.toString(),
      "DOCUMENT_ANALYSIS_COMPLETED",
      `Document analysis completed and written to MongoDB. Document ID: ${documentId}, Analysis ID: ${analysisId}`
    );

    return NextResponse.json({
      success: true,
      analysisId: analysisId,
    });
  } catch (error) {
    console.error("Error analyzing document:", error);
    
    if (documentId) {
      const { db } = await connectToDatabase();
      const documents = db.collection<Document>("documents");
      await documents.updateOne(
        { _id: new ObjectId(documentId) },
        { $set: { status: "FAILED" } }
      ).catch(console.error);
    }
    
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}