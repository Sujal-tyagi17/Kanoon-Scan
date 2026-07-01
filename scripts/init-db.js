// KanoonScan - MongoDB Atlas Schema Initialization Script
// Creates collections, indexes, and schema validation rules on your Atlas cluster.

const { MongoClient } = require("mongodb");

const uri = "mongodb://sujaltyagii:Tyagi2004.@next-shard-00-00.rs24a.mongodb.net:27017,next-shard-00-01.rs24a.mongodb.net:27017,next-shard-00-02.rs24a.mongodb.net:27017/kanoonscan?ssl=true&replicaSet=atlas-pq90b0-shard-0&authSource=admin&retryWrites=true&w=majority&appName=next";

async function initializeSchema() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas successfully!\n");

    const db = client.db("kanoonscan");

    // 1. Create collections with schema validation
    const collections = [
      {
        name: "users",
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["clerkId", "email", "createdAt"],
            properties: {
              clerkId: { bsonType: "string", description: "Clerk authentication ID" },
              email: { bsonType: "string", description: "User email address" },
              name: { bsonType: ["string", "null"], description: "User display name" },
              createdAt: { bsonType: "date", description: "Account creation timestamp" },
            },
          },
        },
      },
      {
        name: "documents",
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "name", "rawText", "status", "createdAt"],
            properties: {
              userId: { bsonType: "string", description: "Reference to users._id" },
              name: { bsonType: "string", description: "Document filename" },
              type: { bsonType: "string", description: "MIME type or file type" },
              fileUrl: { bsonType: ["string", "null"], description: "Uploadthing file URL" },
              rawText: { bsonType: "string", description: "AES-256 encrypted document text" },
              status: {
                bsonType: "string",
                enum: ["UPLOADING", "PROCESSING", "ANALYZING", "complete", "FAILED", "ERROR", "PENDING"],
                description: "Document processing status",
              },
              createdAt: { bsonType: "date", description: "Upload timestamp" },
            },
          },
        },
      },
      {
        name: "analyses",
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["documentId", "riskScore", "riskLevel", "summary", "createdAt"],
            properties: {
              documentId: { bsonType: "string", description: "Reference to documents._id" },
              riskScore: { bsonType: "number", description: "Overall risk score (0-100)" },
              riskLevel: {
                bsonType: "string",
                enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
                description: "Risk classification",
              },
              summary: { bsonType: "string", description: "AI-generated analysis summary" },
              plainEnglish: { bsonType: "string", description: "Plain English translation of document" },
              createdAt: { bsonType: "date", description: "Analysis timestamp" },
            },
          },
        },
      },
      {
        name: "clauses",
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["analysisId", "title", "originalText", "riskLevel"],
            properties: {
              analysisId: { bsonType: "string", description: "Reference to analyses._id" },
              title: { bsonType: "string", description: "Clause title" },
              originalText: { bsonType: "string", description: "Original clause text" },
              riskLevel: { bsonType: "string", description: "Clause risk level" },
              explanation: { bsonType: "string", description: "AI explanation of the clause" },
              whyRisky: { bsonType: "string", description: "Why this clause is risky" },
              suggestion: { bsonType: "string", description: "Risk mitigation suggestion" },
              commonality: { bsonType: "number", description: "How common this clause is (1-10)" },
              category: { bsonType: "string", description: "Legal category" },
              position: { bsonType: "number", description: "Position in document" },
              isSaved: { bsonType: "bool", description: "Whether user bookmarked this clause" },
            },
          },
        },
      },
      {
        name: "riskCategories",
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["analysisId", "name", "score", "level"],
            properties: {
              analysisId: { bsonType: "string", description: "Reference to analyses._id" },
              name: { bsonType: "string", description: "Risk category name" },
              score: { bsonType: "number", description: "Category risk score" },
              level: { bsonType: "string", description: "Category risk level" },
            },
          },
        },
      },
      {
        name: "chats",
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["analysisId", "role", "message", "createdAt"],
            properties: {
              analysisId: { bsonType: "string", description: "Reference to analyses._id" },
              role: { bsonType: "string", enum: ["USER", "ASSISTANT"], description: "Message sender" },
              message: { bsonType: "string", description: "Chat message content" },
              createdAt: { bsonType: "date", description: "Message timestamp" },
            },
          },
        },
      },
      {
        name: "audit_logs",
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "action", "details", "createdAt"],
            properties: {
              userId: { bsonType: "string", description: "User who triggered this event" },
              action: { bsonType: "string", description: "Event type (e.g. DOCUMENT_CREATED)" },
              details: { bsonType: "string", description: "Event details" },
              ipAddress: { bsonType: ["string", "null"], description: "Client IP address" },
              createdAt: { bsonType: "date", description: "Event timestamp" },
            },
          },
        },
      },
    ];

    for (const col of collections) {
      try {
        await db.createCollection(col.name, {
          validator: col.validator,
          validationLevel: "moderate",
          validationAction: "warn",
        });
        console.log(`  ✅ Created collection: ${col.name}`);
      } catch (err) {
        if (err.codeName === "NamespaceExists") {
          // Collection already exists, update the validator
          await db.command({
            collMod: col.name,
            validator: col.validator,
            validationLevel: "moderate",
            validationAction: "warn",
          });
          console.log(`  ⚡ Updated validator for existing collection: ${col.name}`);
        } else {
          throw err;
        }
      }
    }

    // 2. Create indexes
    console.log("\n📇 Creating indexes...");

    await db.collection("users").createIndex({ clerkId: 1 }, { unique: true });
    console.log("  ✅ users.clerkId (unique)");

    await db.collection("users").createIndex({ email: 1 });
    console.log("  ✅ users.email");

    await db.collection("documents").createIndex({ userId: 1 });
    console.log("  ✅ documents.userId");

    await db.collection("documents").createIndex({ createdAt: -1 });
    console.log("  ✅ documents.createdAt (desc)");

    await db.collection("analyses").createIndex({ documentId: 1 }, { unique: true });
    console.log("  ✅ analyses.documentId (unique)");

    await db.collection("clauses").createIndex({ analysisId: 1 });
    console.log("  ✅ clauses.analysisId");

    await db.collection("riskCategories").createIndex({ analysisId: 1 });
    console.log("  ✅ riskCategories.analysisId");

    await db.collection("chats").createIndex({ analysisId: 1, createdAt: 1 });
    console.log("  ✅ chats.analysisId + createdAt (compound)");

    await db.collection("audit_logs").createIndex({ userId: 1 });
    console.log("  ✅ audit_logs.userId");

    await db.collection("audit_logs").createIndex({ createdAt: -1 });
    console.log("  ✅ audit_logs.createdAt (desc)");

    console.log("\n🎉 KanoonScan MongoDB schema initialized successfully!");
    console.log("   Database: kanoonscan");
    console.log("   Collections: 7");
    console.log("   Indexes: 10");

  } catch (error) {
    console.error("❌ Schema initialization failed:", error);
  } finally {
    await client.close();
    console.log("\n🔒 Connection closed.");
  }
}

initializeSchema();
