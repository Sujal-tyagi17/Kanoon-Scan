import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

// Reports only whether config is present (never the values) and whether MongoDB is reachable.
export async function GET() {
  const env = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
    DATABASE_URL: !!process.env.DATABASE_URL,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
  };

  let database: { ok: boolean; name?: string; error?: string } = { ok: false };
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    database = { ok: true, name: db.databaseName };
  } catch (e: any) {
    database = { ok: false, error: String(e?.message || e).slice(0, 300) };
  }

  return NextResponse.json({ ok: database.ok && env.DATABASE_URL && env.CLERK_SECRET_KEY, env, database });
}
