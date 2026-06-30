import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { connectToDatabase } from "@/lib/db";
import { User, Document, Analysis } from "@/types/db";

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

  const getRiskBadgeClass = (risk: "HIGH" | "MEDIUM" | "LOW") => {
    switch (risk) {
      case "HIGH":
        return "bg-error-container/20 text-error border border-error-container/30";
      case "MEDIUM":
        return "bg-primary-container/20 text-primary border border-primary/20";
      case "LOW":
        return "bg-tertiary/10 text-tertiary border border-tertiary/20";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b1326] text-on-background">
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
          <div className="bg-surface-container p-6 rounded-xl border border-outline-variant">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-outline-variant/30">
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
                  search
                </span>
                <input
                  className="bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm w-full text-on-surface outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Filter vault..."
                  type="text"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-data-label">Type:</span>
                  <select className="text-xs font-semibold bg-transparent border-none focus:ring-0 p-0 pr-4 cursor-pointer text-on-surface outline-none">
                    <option className="bg-[#0b1326]">All Files</option>
                    <option className="bg-[#0b1326]">Contracts</option>
                    <option className="bg-[#0b1326]">NDAs</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-data-label">Sort:</span>
                  <select className="text-xs font-semibold bg-transparent border-none focus:ring-0 p-0 pr-4 cursor-pointer text-on-surface outline-none">
                    <option className="bg-[#0b1326]">Date Added</option>
                    <option className="bg-[#0b1326]">Risk Level</option>
                    <option className="bg-[#0b1326]">Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant text-on-surface-variant font-data-label text-[11px] uppercase tracking-widest">
                    <th className="pb-4 pl-4">Document Name</th>
                    <th className="pb-4">Date Uploaded</th>
                    <th className="pb-4">Risk Level</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-5xl mb-3 opacity-30">inventory_2</span>
                        <p className="font-semibold text-md">Vault is empty</p>
                        <p className="text-sm mt-1">Upload a legal document to build your repository.</p>
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr
                        key={doc.id}
                        className="group hover:bg-surface-variant/30 transition-colors"
                      >
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded bg-primary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-sm">
                                {doc.icon}
                              </span>
                            </div>
                            <span className="font-medium text-on-surface">{doc.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-on-surface-variant font-data-label">
                          {doc.dateAnalyzed}
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase ${getRiskBadgeClass(
                              doc.riskLevel
                            )}`}
                          >
                            {doc.riskLevel}
                          </span>
                        </td>
                        <td className="py-4 text-sm">
                          <span className="flex items-center gap-2">
                            <span
                              className={`size-2 rounded-full ${
                                doc.status === "Completed"
                                  ? "bg-tertiary"
                                  : "bg-outline animate-pulse"
                              }`}
                            ></span>{" "}
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <Link href={`/analysis/${doc.id}`} className="text-on-surface-variant hover:text-primary transition-colors inline-block p-1">
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
