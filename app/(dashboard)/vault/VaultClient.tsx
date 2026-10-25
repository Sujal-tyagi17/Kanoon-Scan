"use client";

import { useMemo, useState } from "react";
import DocumentList from "@/components/dashboard/DocumentList";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { DocumentListItem } from "@/lib/utils/documents-ui";

const RISK_ORDER: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

export default function VaultClient({ initialDocuments }: { initialDocuments: DocumentListItem[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"date" | "risk" | "name">("date");
  const [pendingDelete, setPendingDelete] = useState<DocumentListItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = documents.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q)) return false;
      if (riskFilter === "ALL") return true;
      if (riskFilter === "PENDING") return d.status !== "Completed";
      return d.riskLevel === riskFilter;
    });
    if (sortBy === "name") return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "risk")
      return [...filtered].sort((a, b) => (RISK_ORDER[b.riskLevel || ""] || 0) - (RISK_ORDER[a.riskLevel || ""] || 0));
    return filtered; // already newest-first from the server
  }, [documents, query, riskFilter, sortBy]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const doc = pendingDelete;
    setDeletingId(doc.id);
    setError(null);
    try {
      const res = await fetch("/api/documents/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete document");
      }
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      setPendingDelete(null);
    } catch (e: any) {
      setError(e.message || "Failed to delete document. Please try again.");
      setPendingDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  const selectCls =
    "text-sm bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface outline-none focus:border-primary cursor-pointer";

  return (
    <div className="space-y-4">
      {documents.length > 0 && (
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              className="field !py-2 pl-10"
              placeholder="Search by file name…"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search documents"
            />
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-xs text-on-surface-variant">
              Risk
              <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className={selectCls}>
                <option value="ALL">All</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="PENDING">Not analysed</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-on-surface-variant">
              Sort
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className={selectCls}>
                <option value="date">Newest first</option>
                <option value="risk">Highest risk</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      <DocumentList
        documents={visible}
        onDelete={setPendingDelete}
        deletingId={deletingId}
        emptyTitle={documents.length ? "No matching documents" : "Your vault is empty"}
        emptyBody={documents.length ? "Try a different search or filter." : "Scanned documents will appear here."}
        showEmptyCta={documents.length === 0}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this document?"
        description={
          <>
            <span className="font-semibold text-on-surface">{pendingDelete?.name}</span> and its analysis,
            clauses and chat history will be permanently deleted.
          </>
        }
        confirmLabel="Delete"
        destructive
        loading={!!deletingId}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
