/**
 * MongoDB schema for KanoonScan.
 *
 * MongoDB itself is schemaless, so the shape of each collection is enforced
 * here with $jsonSchema validators plus indexes. Applied automatically on the
 * first database connection (see lib/db/index.ts) and also available as a
 * mongosh script: scripts/mongo-schema.js
 *
 * validationLevel "moderate" = new inserts and updates to valid documents
 * must match; old documents that already don't match are left alone.
 */
import type { Db, IndexDescription } from "mongodb";

const str = { bsonType: "string" };
const strOrNull = { bsonType: ["string", "null"] };
const date = { bsonType: "date" };
const num = { bsonType: ["int", "long", "double", "decimal"] };
const LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const COLLECTIONS: Record<string, { validator: object; indexes: IndexDescription[] }> = {
  users: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["clerkId", "email", "createdAt"],
        properties: {
          clerkId: { ...str, description: "Clerk user id (user_...)" },
          email: str,
          name: strOrNull,
          createdAt: date,
        },
      },
    },
    indexes: [{ key: { clerkId: 1 }, name: "clerkId_unique", unique: true }],
  },

  documents: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "name", "type", "rawText", "status", "createdAt"],
        properties: {
          userId: { ...str, description: "users._id as a string" },
          name: str,
          type: str,
          fileUrl: strOrNull,
          rawText: { ...str, description: "AES-256 encrypted document text (iv:ciphertext)" },
          status: str,
          createdAt: date,
        },
      },
    },
    indexes: [{ key: { userId: 1, createdAt: -1 }, name: "user_recent" }],
  },

  analyses: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["documentId", "riskScore", "riskLevel", "summary", "createdAt"],
        properties: {
          documentId: { ...str, description: "documents._id as a string" },
          riskScore: { ...num, minimum: 0, maximum: 100 },
          riskLevel: { enum: LEVELS },
          summary: str,
          plainEnglish: str,
          overallVerdict: { bsonType: ["object", "null"] },
          positiveClauses: { bsonType: "array" },
          keyInformation: { bsonType: "object" },
          confidenceScore: { bsonType: ["string", "null", "int", "long", "double"] },
          shareToken: strOrNull,
          shareEnabled: { bsonType: "bool" },
          createdAt: date,
        },
      },
    },
    // One analysis per document (also makes the duplicate-request guard in /api/analyze work)
    indexes: [
      { key: { documentId: 1 }, name: "documentId_unique", unique: true },
      // Public share links look analyses up by token
      { key: { shareToken: 1 }, name: "shareToken_unique", unique: true, partialFilterExpression: { shareToken: { $type: "string" } } },
    ],
  },

  clauses: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["analysisId", "title", "originalText", "riskLevel", "position", "isSaved"],
        properties: {
          analysisId: str,
          title: str,
          originalText: str,
          explanation: str,
          riskLevel: { enum: LEVELS },
          severity: str,
          whyRisky: str,
          suggestion: str,
          commonality: num,
          category: str,
          position: num,
          isSaved: { bsonType: "bool" },
          whoBenefits: str,
          whoIsAtRisk: str,
        },
      },
    },
    indexes: [{ key: { analysisId: 1, position: 1 }, name: "analysis_position" }],
  },

  riskCategories: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["analysisId", "name", "score", "level"],
        properties: {
          analysisId: str,
          name: str,
          score: { ...num, minimum: 0, maximum: 100 },
          level: { enum: LEVELS },
        },
      },
    },
    indexes: [{ key: { analysisId: 1 }, name: "analysisId" }],
  },

  chats: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["analysisId", "role", "message", "createdAt"],
        properties: {
          analysisId: str,
          role: { enum: ["USER", "ASSISTANT"] },
          message: str,
          createdAt: date,
        },
      },
    },
    indexes: [{ key: { analysisId: 1, createdAt: 1 }, name: "analysis_time" }],
  },

  rate_limits: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["key", "userId", "action", "count", "expiresAt"],
        properties: {
          key: { ...str, description: "userId:action:YYYY-MM-DD (IST day)" },
          userId: str,
          action: { enum: ["analysis", "chat"] },
          count: num,
          expiresAt: date,
        },
      },
    },
    indexes: [
      { key: { key: 1 }, name: "key_unique", unique: true },
      // MongoDB deletes counters automatically once they expire
      { key: { expiresAt: 1 }, name: "expiresAt_ttl", expireAfterSeconds: 0 },
    ],
  },

  audit_logs: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "action", "details", "createdAt"],
        properties: {
          userId: str,
          action: str,
          details: str,
          ipAddress: str,
          createdAt: date,
        },
      },
    },
    indexes: [{ key: { userId: 1, createdAt: -1 }, name: "user_time" }],
  },
};

const sameKey = (a: object, b: object) => JSON.stringify(a) === JSON.stringify(b);
const sameJson = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * Ensures each index exists, one at a time, matching indexes by KEY rather than
 * name. An existing index with the same key and options is kept as-is (whatever
 * it's called). One with the same key but different options (e.g. not unique)
 * is replaced; if the replacement can't be built (e.g. duplicate data), the
 * original is restored and a warning is logged.
 */
async function ensureIndexes(db: Db, name: string, indexes: IndexDescription[]) {
  const col = db.collection(name);
  let existing: any[] = [];
  try {
    existing = await col.indexes();
  } catch {
    // collection may not exist yet; createIndex will create it
  }

  for (const idx of indexes) {
    const { key, ...opts } = idx as any;
    const match = existing.find((e) => sameKey(e.key, key));
    try {
      if (!match) {
        await col.createIndex(key, opts);
        continue;
      }
      const compatible =
        !!match.unique === !!opts.unique &&
        sameJson(match.partialFilterExpression, opts.partialFilterExpression) &&
        sameJson(match.expireAfterSeconds, opts.expireAfterSeconds);
      if (compatible) continue;

      // Don't drop a working index if a unique version can't be built anyway
      if (opts.unique && !match.unique) {
        const groupId = Object.fromEntries(Object.keys(key).map((f) => [f, `$${f}`]));
        const dupes = await col
          .aggregate([
            ...(opts.partialFilterExpression ? [{ $match: opts.partialFilterExpression }] : []),
            { $group: { _id: groupId, n: { $sum: 1 } } },
            { $match: { n: { $gt: 1 } } },
            { $limit: 1 },
          ])
          .toArray();
        if (dupes.length) {
          console.warn(`[schema] ${name} has duplicate ${Object.keys(key).join("+")} values; keeping non-unique ${match.name}`);
          continue;
        }
      }

      await col.dropIndex(match.name);
      try {
        await col.createIndex(key, opts);
        console.info(`[schema] replaced index ${name}.${match.name} with ${opts.name}`);
      } catch (e: any) {
        const { v, key: k, name: n, ns, ...oldOpts } = match;
        await col.createIndex(k, { name: n, ...oldOpts });
        console.warn(`[schema] kept existing ${name}.${n}; could not apply ${opts.name}: ${e?.message}`);
      }
    } catch (e: any) {
      console.warn(`[schema] index ${name}.${opts.name}: ${e?.message}`);
    }
  }
}

/**
 * Creates collections with validators, or updates validators on existing ones,
 * and ensures indexes. Idempotent and never throws: a missing permission or a
 * duplicate that blocks a unique index is logged, and the app keeps working.
 */
export async function applySchema(db: Db) {
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));

  for (const [name, { validator, indexes }] of Object.entries(COLLECTIONS)) {
    try {
      if (existing.has(name)) {
        await db.command({ collMod: name, validator, validationLevel: "moderate", validationAction: "error" });
      } else {
        await db.createCollection(name, { validator, validationLevel: "moderate", validationAction: "error" });
      }
    } catch (e: any) {
      console.warn(`[schema] could not apply validator to ${name}: ${e?.message}`);
    }
    await ensureIndexes(db, name, indexes);
  }
}
