import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { Clause } from "@/types/db";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clauseId, isSaved } = await req.json();
    if (!clauseId) {
      return NextResponse.json({ error: "Clause ID is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const clausesCol = db.collection<Clause>("clauses");

    // Perform database update
    const result = await clausesCol.updateOne(
      { _id: new ObjectId(clauseId) },
      { $set: { isSaved: !!isSaved } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Clause not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, isSaved: !!isSaved });
  } catch (error) {
    console.error("Error updating clause saved status:", error);
    return NextResponse.json({ error: "Failed to update clause" }, { status: 500 });
  }
}
