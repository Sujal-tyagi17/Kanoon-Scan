// KanoonScan MongoDB schema — run in mongosh / Compass shell, connected to the kanoonscan database:
//   use kanoonscan
//   load("scripts/mongo-schema.js")   (or paste this file into the shell)
// Generated from lib/db/schema.ts. The app also applies this automatically on startup.

const COLLECTIONS = {
  "users": {
    "validator": {
      "$jsonSchema": {
        "bsonType": "object",
        "required": [
          "clerkId",
          "email",
          "createdAt"
        ],
        "properties": {
          "clerkId": {
            "bsonType": "string",
            "description": "Clerk user id (user_...)"
          },
          "email": {
            "bsonType": "string"
          },
          "name": {
            "bsonType": [
              "string",
              "null"
            ]
          },
          "createdAt": {
            "bsonType": "date"
          }
        }
      }
    },
    "indexes": [
      {
        "key": {
          "clerkId": 1
        },
        "name": "clerkId_unique",
        "unique": true
      }
    ]
  },
  "documents": {
    "validator": {
      "$jsonSchema": {
        "bsonType": "object",
        "required": [
          "userId",
          "name",
          "type",
          "rawText",
          "status",
          "createdAt"
        ],
        "properties": {
          "userId": {
            "bsonType": "string",
            "description": "users._id as a string"
          },
          "name": {
            "bsonType": "string"
          },
          "type": {
            "bsonType": "string"
          },
          "fileUrl": {
            "bsonType": [
              "string",
              "null"
            ]
          },
          "rawText": {
            "bsonType": "string",
            "description": "AES-256 encrypted document text (iv:ciphertext)"
          },
          "status": {
            "bsonType": "string"
          },
          "createdAt": {
            "bsonType": "date"
          }
        }
      }
    },
    "indexes": [
      {
        "key": {
          "userId": 1,
          "createdAt": -1
        },
        "name": "user_recent"
      }
    ]
  },
  "analyses": {
    "validator": {
      "$jsonSchema": {
        "bsonType": "object",
        "required": [
          "documentId",
          "riskScore",
          "riskLevel",
          "summary",
          "createdAt"
        ],
        "properties": {
          "documentId": {
            "bsonType": "string",
            "description": "documents._id as a string"
          },
          "riskScore": {
            "bsonType": [
              "int",
              "long",
              "double",
              "decimal"
            ],
            "minimum": 0,
            "maximum": 100
          },
          "riskLevel": {
            "enum": [
              "LOW",
              "MEDIUM",
              "HIGH",
              "CRITICAL"
            ]
          },
          "summary": {
            "bsonType": "string"
          },
          "plainEnglish": {
            "bsonType": "string"
          },
          "overallVerdict": {
            "bsonType": [
              "object",
              "null"
            ]
          },
          "positiveClauses": {
            "bsonType": "array"
          },
          "keyInformation": {
            "bsonType": "object"
          },
          "confidenceScore": {
            "bsonType": [
              "string",
              "null",
              "int",
              "long",
              "double"
            ]
          },
          "createdAt": {
            "bsonType": "date"
          }
        }
      }
    },
    "indexes": [
      {
        "key": {
          "documentId": 1
        },
        "name": "documentId_unique",
        "unique": true
      }
    ]
  },
  "clauses": {
    "validator": {
      "$jsonSchema": {
        "bsonType": "object",
        "required": [
          "analysisId",
          "title",
          "originalText",
          "riskLevel",
          "position",
          "isSaved"
        ],
        "properties": {
          "analysisId": {
            "bsonType": "string"
          },
          "title": {
            "bsonType": "string"
          },
          "originalText": {
            "bsonType": "string"
          },
          "explanation": {
            "bsonType": "string"
          },
          "riskLevel": {
            "enum": [
              "LOW",
              "MEDIUM",
              "HIGH",
              "CRITICAL"
            ]
          },
          "severity": {
            "bsonType": "string"
          },
          "whyRisky": {
            "bsonType": "string"
          },
          "suggestion": {
            "bsonType": "string"
          },
          "commonality": {
            "bsonType": [
              "int",
              "long",
              "double",
              "decimal"
            ]
          },
          "category": {
            "bsonType": "string"
          },
          "position": {
            "bsonType": [
              "int",
              "long",
              "double",
              "decimal"
            ]
          },
          "isSaved": {
            "bsonType": "bool"
          },
          "whoBenefits": {
            "bsonType": "string"
          },
          "whoIsAtRisk": {
            "bsonType": "string"
          }
        }
      }
    },
    "indexes": [
      {
        "key": {
          "analysisId": 1,
          "position": 1
        },
        "name": "analysis_position"
      }
    ]
  },
  "riskCategories": {
    "validator": {
      "$jsonSchema": {
        "bsonType": "object",
        "required": [
          "analysisId",
          "name",
          "score",
          "level"
        ],
        "properties": {
          "analysisId": {
            "bsonType": "string"
          },
          "name": {
            "bsonType": "string"
          },
          "score": {
            "bsonType": [
              "int",
              "long",
              "double",
              "decimal"
            ],
            "minimum": 0,
            "maximum": 100
          },
          "level": {
            "enum": [
              "LOW",
              "MEDIUM",
              "HIGH",
              "CRITICAL"
            ]
          }
        }
      }
    },
    "indexes": [
      {
        "key": {
          "analysisId": 1
        },
        "name": "analysisId"
      }
    ]
  },
  "chats": {
    "validator": {
      "$jsonSchema": {
        "bsonType": "object",
        "required": [
          "analysisId",
          "role",
          "message",
          "createdAt"
        ],
        "properties": {
          "analysisId": {
            "bsonType": "string"
          },
          "role": {
            "enum": [
              "USER",
              "ASSISTANT"
            ]
          },
          "message": {
            "bsonType": "string"
          },
          "createdAt": {
            "bsonType": "date"
          }
        }
      }
    },
    "indexes": [
      {
        "key": {
          "analysisId": 1,
          "createdAt": 1
        },
        "name": "analysis_time"
      }
    ]
  },
  "audit_logs": {
    "validator": {
      "$jsonSchema": {
        "bsonType": "object",
        "required": [
          "userId",
          "action",
          "details",
          "createdAt"
        ],
        "properties": {
          "userId": {
            "bsonType": "string"
          },
          "action": {
            "bsonType": "string"
          },
          "details": {
            "bsonType": "string"
          },
          "ipAddress": {
            "bsonType": "string"
          },
          "createdAt": {
            "bsonType": "date"
          }
        }
      }
    },
    "indexes": [
      {
        "key": {
          "userId": 1,
          "createdAt": -1
        },
        "name": "user_time"
      }
    ]
  }
};

const existing = db.getCollectionNames();
for (const [name, { validator, indexes }] of Object.entries(COLLECTIONS)) {
  if (existing.includes(name)) {
    db.runCommand({ collMod: name, validator, validationLevel: "moderate", validationAction: "error" });
  } else {
    db.createCollection(name, { validator, validationLevel: "moderate", validationAction: "error" });
  }
  const col = db.getCollection(name);
  const current = col.getIndexes();
  for (const idx of indexes) {
    const { key, ...opts } = idx;
    const match = current.find((e) => JSON.stringify(e.key) === JSON.stringify(key));
    if (match && !!match.unique === !!opts.unique) {
      print("  = " + name + "." + match.name + " already exists");
      continue;
    }
    if (match) {
      print("  ~ replacing " + name + "." + match.name + " with " + opts.name);
      col.dropIndex(match.name);
    }
    col.createIndex(key, opts);
  }
  print("✔ " + name);
}
