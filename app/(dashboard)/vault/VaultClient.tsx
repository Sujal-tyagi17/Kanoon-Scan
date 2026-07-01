"use client";

import Link from "next/link";
import { useState } from "react";

interface VaultDocument {
  id: string;
  name: string;
  dateAnalyzed: string;
  riskLevel: string; // Allow "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  status: "Completed" | "Processing";
  icon: string;
}

interface VaultClientProps {
  initialDocuments: VaultDocument[];
}

export default function VaultClient({ initialDocuments }: VaultClientProps) {
  const [documents, setDocuments] = useState<VaultDocument[]>(initialDocuments);
  const [filterText, setFilterText] = useState("");
  const [selectedType, setSelectedType] = useState("All Files");
  const [sortBy, setSortBy] = useState("Date Added");

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

  const handleDelete = async (docId: string, docName: string) => {
    if (!confirm(`Are you sure you want to delete "${docName}"? This will permanently delete the scan and all analyzed risk details.`)) {
      return;
    }

    try {
      const res = await fetch("/api/documents/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId }),
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      } else {
        const errData = await res.json();
        alert(`Failed to delete document: ${errData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Failed to delete document. Please try again.");
    }
  };

  // 1. Filter documents by name (search) & type (NDA, Contract)
  const filtered = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(filterText.toLowerCase());
    
    if (selectedType === "Contracts") {
      // Simple name check heuristic
      return matchesSearch && !doc.name.toLowerCase().includes("nda");
    }
    if (selectedType === "NDAs") {
      return matchesSearch && doc.name.toLowerCase().includes("nda");
    }
    return matchesSearch;
  });

  // 2. Sort documents
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Name (A-Z)") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "Risk Level") {
      const riskVal: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (riskVal[b.riskLevel] || 0) - (riskVal[a.riskLevel] || 0);
    }
    // Default: Date Added (descending by sorting initial db index order or ID comparisons)
    return 0; // Preserve default descending DB fetch order
  });

  return (
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
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-data-label">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs font-semibold bg-background border border-outline-variant/30 rounded p-1.5 cursor-pointer text-on-surface outline-none focus:border-primary"
            >
              <option value="All Files">All Files</option>
              <option value="Contracts">Contracts</option>
              <option value="NDAs">NDAs</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-data-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold bg-background border border-outline-variant/30 rounded p-1.5 cursor-pointer text-on-surface outline-none focus:border-primary"
            >
              <option value="Date Added">Date Added</option>
              <option value="Risk Level">Risk Level</option>
              <option value="Name (A-Z)">Name (A-Z)</option>
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
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-3 opacity-30">inventory_2</span>
                  <p className="font-semibold text-md">No matching files found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                </td>
              </tr>
            ) : (
              sorted.map((doc) => (
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
                    <div className="flex gap-2 justify-end items-center">
                      <Link href={`/analysis/${doc.id}`} className="text-on-surface-variant hover:text-primary transition-colors inline-block p-1" title="View analysis">
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </Link>
                      <button 
                        onClick={() => handleDelete(doc.id, doc.name)}
                        className="text-on-surface-variant hover:text-error transition-colors inline-block p-1" 
                        title="Delete scan"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
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
