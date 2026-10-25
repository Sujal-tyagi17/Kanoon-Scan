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
          createdAt: date,
        },
      },
    },
    // One analysis per document (also makes the duplicate-request guard in /api/analyze work)
    indexes: [{ key: { documentId: 1 }, name: "documentId_unique", unique: true }],
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
    try {
      if (indexes.length) await db.collection(name).createIndexes(indexes);
    } catch (e: any) {
      console.warn(`[schema] could not create indexes on ${name}: ${e?.message}`);
    }
  }
}
