import { auth, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/types/db";

export type DbUser = User & { _id: NonNullable<User["_id"]> };

/**
 * Returns the MongoDB user record for the signed-in Clerk user, creating it
 * on first use. This means the app works even when the Clerk webhook is not
 * configured (or fires late), which previously caused "User not found" errors
 * on upload, chat and delete for freshly signed-up users.
 *
 * Returns null when nobody is signed in.
 */
export async function getOrCreateDbUser(): Promise<DbUser | null> {
  const { userId } = auth();
  if (!userId) return null;

  const { db } = await connectToDatabase();
  const users = db.collection<User>("users");

  const existing = await users.findOne({ clerkId: userId });
  if (existing) return existing as DbUser;

  // Only hit the Clerk API when we actually need profile details.
  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress
    || clerkUser?.emailAddresses[0]?.emailAddress
    || "";
  const name = `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || null;

  await ensureUserIndex();

  // Upsert so concurrent first requests (or a webhook racing us) never create duplicates.
  const result = await users.findOneAndUpdate(
    { clerkId: userId },
    { $setOnInsert: { clerkId: userId, email, name, createdAt: new Date() } },
    { upsert: true, returnDocument: "after" }
  );

  return result as DbUser;
}

/** Ensures the users collection has a unique index on clerkId (idempotent). */
let indexEnsured = false;
export async function ensureUserIndex() {
  if (indexEnsured) return;
  try {
    const { db } = await connectToDatabase();
    await db.collection("users").createIndex({ clerkId: 1 }, { unique: true });
    indexEnsured = true;
  } catch (e) {
    // An existing duplicate would block the index; log and continue rather than break auth.
    console.error("Could not ensure unique clerkId index:", e);
    indexEnsured = true;
  }
}
