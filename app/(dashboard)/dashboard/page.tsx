import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import StatsCards from "@/components/dashboard/StatsCards";
import DocumentList from "@/components/dashboard/DocumentList";
import { connectToDatabase } from "@/lib/db";
import { User, Document, Analysis } from "@/types/db";

export default async function DashboardPage() {
  // Get current user from Clerk
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
    // Graceful fallback: create user if they are missing
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

  // Fetch user's recent 5 documents
  const rawDocs = await documentsCol.find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .limit(5)
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

  // Calculate statistics
  const totalDocuments = await documentsCol.countDocuments({ userId: userObjectId });

  const completedDocuments = await documentsCol.countDocuments({ 
    userId: userObjectId,
    status: "complete" 
  });

  // Calculate average risk level
  const userDocIds = (await documentsCol.find({ userId: userObjectId }, { projection: { _id: 1 } }).toArray())
    .map(d => d._id.toString());

  const userAnalyses = await analysesCol.find({ documentId: { $in: userDocIds } }).toArray();

  const riskLevelMap: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 3 };
  const avgRisk = userAnalyses.length > 0
    ? userAnalyses.reduce((sum: number, a: any) => sum + (riskLevelMap[a.riskLevel.toUpperCase()] || 2), 0) / userAnalyses.length
    : 0;
  
  const avgRiskLabel = avgRisk < 1.5 ? "Low" : avgRisk < 2.5 ? "Medium" : "High";

  // Get user's first name for greeting
  const firstName = user.firstName || user.username || "User";

  // Prepare stats for StatsCards component
  const stats = [
    {
      label: "Docs Scanned",
      icon: "description",
      value: totalDocuments,
      trend: { value: "—", isPositive: true },
    },
    {
      label: "Completed",
      icon: "check_circle",
      value: completedDocuments,
      trend: { value: "—", isPositive: true },
    },
    {
      label: "Avg Risk",
      icon: "security",
      value: totalDocuments > 0 ? avgRiskLabel : "N/A",
      trend: { value: "—", isPositive: avgRisk < 2 },
    },
    {
      label: "Analyses",
      icon: "analytics",
      value: userAnalyses.length,
      trend: { value: "—", isPositive: true },
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        {/* Top Bar */}
        <TopBar />

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* Welcome Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-headline-xl text-on-background mb-1">
                Welcome back, {firstName}
              </h2>
              <p className="text-on-surface-variant font-body-md">
                Here's an overview of your institutional document analysis pipeline.
              </p>
            </div>
            <Link href="/scan">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-white font-semibold rounded-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 transition-all">
                <span className="material-symbols-outlined">upload_file</span>
                <span>New Scan</span>
              </button>
            </Link>
          </div>

          {/* Stats Grid */}
          <StatsCards stats={stats} />

          {/* Recent Documents Table */}
          <DocumentList documents={documents} />
        </div>
      </main>
    </div>
  );
}
