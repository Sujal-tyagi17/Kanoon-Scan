const { MongoClient } = require("mongodb");

// Try direct connection to one shard with directConnection=true
const uri = "mongodb://sujaltyagii:Tyagi2004.@next-shard-00-00.rs24a.mongodb.net:27017/kanoonscan?ssl=true&authSource=admin&directConnection=true";

async function test() {
  console.log("🔍 Testing direct connection to single shard...");
  console.log("   Host: next-shard-00-00.rs24a.mongodb.net:27017");
  
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  
  try {
    await client.connect();
    console.log("✅ Connected successfully!");
    
    const db = client.db("kanoonscan");
    const result = await db.command({ ping: 1 });
    console.log("✅ Ping result:", result);
    
    // Get the replica set config to find the correct set name
    try {
      const replStatus = await db.admin().command({ replSetGetStatus: 1 });
      console.log("✅ Replica Set Name:", replStatus.set);
      console.log("   Members:");
      replStatus.members.forEach(m => {
        console.log(`   - ${m.name} (${m.stateStr})`);
      });
    } catch (e) {
      console.log("ℹ️  Could not get replica set status (normal for Atlas free tier):", e.message);
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    if (error.cause) {
      console.error("   Cause:", error.cause.message || error.cause);
    }
  } finally {
    await client.close();
    console.log("\n🔒 Connection closed.");
  }
}

test();
