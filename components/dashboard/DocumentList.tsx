import Link from "next/link";

interface DocumentItem {
  id: string;
  name: string;
  dateAnalyzed: string;
  riskLevel: string; // Allow "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  status: "Completed" | "Processing";
  icon: string;
}

interface DocumentListProps {
  documents: DocumentItem[];
}

const getRiskBadgeClass = (risk: string) => {
  switch (risk) {
    case "CRITICAL":
      return "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30";
    case "HIGH":
      return "bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/30";
    case "MEDIUM":
      return "bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30";
    case "LOW":
      return "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30";
    default:
      return "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30";
  }
};

export default function DocumentList({ documents }: DocumentListProps) {
  return (
    <div className="bg-surface-container p-6 rounded-xl border border-outline-variant">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Recent Documents</h3>
          <p className="text-on-surface-variant text-xs mt-0.5">Scanned contracts and legal briefings</p>
        </div>
        <Link href="/vault" className="text-primary text-sm font-button-label hover:underline">
          View all
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant text-on-surface-variant font-data-label text-[11px] uppercase tracking-widest">
              <th className="pb-4 pl-4">Document Name</th>
              <th className="pb-4">Date</th>
              <th className="pb-4">Risk Level</th>
              <th className="pb-4">Status</th>
              <th className="pb-4 pr-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">description</span>
                  <p className="font-medium">No documents yet</p>
                  <p className="text-sm mt-1">Upload your first document to get started</p>
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
  );
}
