"use client";

import Link from "next/link";
import { DocumentListItem, riskBadgeClass, statusDotClass } from "@/lib/utils/documents-ui";

interface DocumentListProps {
  documents: DocumentListItem[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  onDelete?: (doc: DocumentListItem) => void;
  deletingId?: string | null;
  emptyTitle?: string;
  emptyBody?: string;
  showEmptyCta?: boolean;
}

function RiskBadge({ risk }: { risk: string | null }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${riskBadgeClass(risk)}`}>
      {risk || "—"}
    </span>
  );
}

function Status({ status }: { status: DocumentListItem["status"] }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
      <span className={`size-2 rounded-full ${statusDotClass(status)}`} />
      {status}
    </span>
  );
}

export default function DocumentList({
  documents,
  title,
  subtitle,
  showViewAll,
  onDelete,
  deletingId,
  emptyTitle = "No documents yet",
  emptyBody = "Upload a contract or paste its text to get your first risk report.",
  showEmptyCta = true,
}: DocumentListProps) {
  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant">
      {(title || showViewAll) && (
        <div className="flex justify-between items-center px-5 pt-5 pb-4">
          <div>
            {title && <h3 className="text-lg font-bold text-on-surface">{title}</h3>}
            {subtitle && <p className="text-on-surface-variant text-xs mt-0.5">{subtitle}</p>}
          </div>
          {showViewAll && documents.length > 0 && (
            <Link href="/vault" className="text-primary text-sm font-semibold hover:underline focus-ring rounded">
              View all
            </Link>
          )}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="py-14 px-6 text-center text-on-surface-variant flex flex-col items-center">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-primary text-3xl">description</span>
          </div>
          <p className="font-semibold text-on-surface">{emptyTitle}</p>
          <p className="text-sm mt-1 max-w-sm">{emptyBody}</p>
          {showEmptyCta && (
            <Link href="/scan" className="btn-primary mt-5">
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Scan a document
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-y border-outline-variant/60 text-on-surface-variant font-data-label text-[11px] uppercase tracking-widest">
                  <th className="py-3 pl-5 font-medium">Document</th>
                  <th className="py-3 font-medium">Date</th>
                  <th className="py-3 font-medium">Risk</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 pr-5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {documents.map((doc) => (
                  <tr key={doc.id} className="group hover:bg-surface-variant/30 transition-colors">
                    <td className="py-3.5 pl-5 max-w-[320px]">
                      <Link href={doc.href} className="flex items-center gap-3 focus-ring rounded">
                        <span className="size-8 shrink-0 rounded bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-[18px]">article</span>
                        </span>
                        <span className="font-medium text-on-surface truncate group-hover:text-primary transition-colors" title={doc.name}>
                          {doc.name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3.5 text-sm text-on-surface-variant font-data-label whitespace-nowrap">{doc.dateAnalyzed}</td>
                    <td className="py-3.5"><RiskBadge risk={doc.riskLevel} /></td>
                    <td className="py-3.5"><Status status={doc.status} /></td>
                    <td className="py-3.5 pr-5">
                      <div className="flex gap-1 justify-end items-center">
                        <Link
                          href={doc.href}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-variant transition-colors focus-ring"
                          title={doc.status === "Completed" ? "View report" : doc.status === "Processing" ? "View progress" : "Try again"}
                          aria-label={`Open ${doc.name}`}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {doc.status === "Failed" ? "refresh" : "visibility"}
                          </span>
                        </Link>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(doc)}
                            disabled={deletingId === doc.id}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors disabled:opacity-40 focus-ring"
                            title="Delete"
                            aria-label={`Delete ${doc.name}`}
                          >
                            <span className={`material-symbols-outlined text-lg ${deletingId === doc.id ? "animate-spin" : ""}`}>
                              {deletingId === doc.id ? "progress_activity" : "delete"}
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="md:hidden divide-y divide-outline-variant/30 border-t border-outline-variant/60">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 px-4 py-3.5">
                <Link href={doc.href} className="flex-1 min-w-0 focus-ring rounded">
                  <p className="font-medium text-on-surface truncate">{doc.name}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <RiskBadge risk={doc.riskLevel} />
                    <Status status={doc.status} />
                    <span className="text-xs text-outline">{doc.dateAnalyzed}</span>
                  </div>
                </Link>
                {onDelete && (
                  <button
                    onClick={() => onDelete(doc)}
                    disabled={deletingId === doc.id}
                    className="p-2 rounded-lg text-on-surface-variant hover:text-error focus-ring"
                    aria-label={`Delete ${doc.name}`}
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
