import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { connectToDatabase } from "@/lib/db";
import { User, Document, Analysis } from "@/types/db";
import VaultClient from "./VaultClient";

export default async function VaultPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const { db } = await connectToDatabase();
  const users = db.collection<User>("users");
  const documentsCol = db.collection<Document>("documents");
  const analysesCol = db.collection<Analysis>("analyses");

  // Fetch user from database
  let dbUser = await users.findOne({ clerkId: user.id });

  if (!dbUser) {
    const insertResult = await users.insertOne({
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      createdAt: new Date(),
    });
    dbUser = {
      _id: insertResult.insertedId,
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      createdAt: new Date(),
    };
  }

  const userObjectId = dbUser!._id!.toString();

  // Fetch all documents for this user
  const rawDocs = await documentsCol.find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .toArray();

  const documents = [];
  for (const doc of rawDocs) {
    const docId = doc._id!.toString();
    const docAnalysis = await analysesCol.findOne({ documentId: docId });
    
    documents.push({
      id: docId,
      name: doc.name,
      dateAnalyzed: doc.createdAt.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      }),
      riskLevel: (docAnalysis?.riskLevel?.toUpperCase() || "MEDIUM") as "HIGH" | "MEDIUM" | "LOW",
      status: (doc.status === "complete" ? "Completed" : "Processing") as "Completed" | "Processing",
      icon: "article",
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        {/* Top Bar */}
        <TopBar />

        {/* Content */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-gutter">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-headline-xl text-headline-xl text-on-background mb-2">Document Vault</h2>
              <p className="font-body-lg text-on-surface-variant">Review and manage your secure, encrypted contract repository.</p>
            </div>
            <Link href="/scan">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-white font-semibold rounded-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 transition-all">
                <span className="material-symbols-outlined">upload_file</span>
                <span>Upload New</span>
              </button>
            </Link>
          </header>

          {/* Table Container */}
          <VaultClient initialDocuments={documents} />
        </div>
      </main>
    </div>
  );
}
