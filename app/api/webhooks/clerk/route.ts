import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { connectToDatabase } from "@/lib/db";
import { ensureUserIndex } from "@/lib/auth";
import { User } from "@/types/db";

type ClerkUserPayload = {
  id: string;
  email_addresses?: { id: string; email_address: string }[];
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

type WebhookEvent = {
  data: ClerkUserPayload;
  type: string;
};

function primaryEmail(data: ClerkUserPayload) {
  const emails = data.email_addresses || [];
  return (
    emails.find((e) => e.id === data.primary_email_address_id)?.email_address ||
    emails[0]?.email_address ||
    ""
  );
}

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("WEBHOOK_SECRET is not set; Clerk webhook ignored.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  // Signature must be verified against the exact raw body. Re-serialising
  // parsed JSON (the old approach) can change the bytes and break verification.
  const body = await req.text();

  let evt: WebhookEvent;
  try {
    evt = new Webhook(WEBHOOK_SECRET).verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const users = db.collection<User>("users");
    const { id } = evt.data;

    if (evt.type === "user.created" || evt.type === "user.updated") {
      await ensureUserIndex();
      const name = `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim() || null;
      // Upsert: the app may already have created this user on first sign-in.
      await users.updateOne(
        { clerkId: id },
        {
          $set: { email: primaryEmail(evt.data), name },
          $setOnInsert: { clerkId: id, createdAt: new Date() },
        },
        { upsert: true }
      );
    } else if (evt.type === "user.deleted" && id) {
      await users.deleteOne({ clerkId: id });
    }
  } catch (error) {
    console.error("Error handling Clerk webhook:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
