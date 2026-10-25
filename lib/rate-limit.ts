import { connectToDatabase } from "@/lib/db";

/**
 * Simple per-user daily limits stored in MongoDB (collection: rate_limits).
 * One counter document per user/action/day; a TTL index deletes old ones.
 * Days roll over at midnight India time (IST).
 */

export type LimitedAction = "analysis" | "chat";

const DEFAULT_LIMITS: Record<LimitedAction, number> = { analysis: 10, chat: 50 };
const ENV_VARS: Record<LimitedAction, string> = { analysis: "DAILY_ANALYSIS_LIMIT", chat: "DAILY_CHAT_LIMIT" };
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function getLimit(action: LimitedAction) {
  const n = Number(process.env[ENV_VARS[action]]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_LIMITS[action];
}

function istDay(now = Date.now()) {
  return new Date(now + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Next IST midnight, as a real Date. */
function nextReset(now = Date.now()) {
  const ist = new Date(now + IST_OFFSET_MS);
  const midnightIst = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + 1);
  return new Date(midnightIst - IST_OFFSET_MS);
}

function keyFor(userId: string, action: LimitedAction) {
  return `${userId}:${action}:${istDay()}`;
}

export interface LimitResult {
  allowed: boolean;
  used: number;
  limit: number;
  resetsAt: Date;
}

/** Atomically uses one unit of the user's daily quota. Over the limit → allowed: false (nothing consumed). */
export async function consumeLimit(userId: string, action: LimitedAction): Promise<LimitResult> {
  const limit = getLimit(action);
  const resetsAt = nextReset();
  const { db } = await connectToDatabase();
  const col = db.collection("rate_limits");
  const key = keyFor(userId, action);

  const doc = await col.findOneAndUpdate(
    { key },
    {
      $inc: { count: 1 },
      $setOnInsert: { key, userId, action, expiresAt: new Date(resetsAt.getTime() + 24 * 60 * 60 * 1000) },
    },
    { upsert: true, returnDocument: "after" }
  );
  const used = (doc?.count as number) ?? 1;

  if (used > limit) {
    await col.updateOne({ key }, { $inc: { count: -1 } });
    return { allowed: false, used: limit, limit, resetsAt };
  }
  return { allowed: true, used, limit, resetsAt };
}

/** Gives one unit back, e.g. when the AI call failed and the user should be able to retry for free. */
export async function refundLimit(userId: string, action: LimitedAction) {
  try {
    const { db } = await connectToDatabase();
    await db.collection("rate_limits").updateOne({ key: keyFor(userId, action), count: { $gt: 0 } }, { $inc: { count: -1 } });
  } catch (e) {
    console.error("Failed to refund rate limit:", e);
  }
}

/** Current usage without consuming anything (for showing "3 / 10 used today"). */
export async function getUsage(userId: string, action: LimitedAction) {
  const { db } = await connectToDatabase();
  const doc = await db.collection("rate_limits").findOne({ key: keyFor(userId, action) });
  return { used: Math.min((doc?.count as number) ?? 0, getLimit(action)), limit: getLimit(action) };
}

export function limitMessage(action: LimitedAction, r: LimitResult) {
  const what = action === "analysis" ? "document analyses" : "chat messages";
  return `You've used all ${r.limit} ${what} for today. Your limit resets at midnight (IST).`;
}
