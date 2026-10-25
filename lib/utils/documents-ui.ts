// Client-safe helpers/types for document lists (no database imports here).

export type DocStatus = "Completed" | "Processing" | "Failed";

export interface DocumentListItem {
  id: string;
  name: string;
  dateAnalyzed: string;
  riskLevel: string | null;
  riskScore: number | null;
  status: DocStatus;
  analysisId: string | null;
  /** Where clicking the row should go */
  href: string;
}

export function riskBadgeClass(risk: string | null) {
  switch (risk) {
    case "CRITICAL":
      return "bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30";
    case "HIGH":
      return "bg-[#F97316]/15 text-[#FB923C] border border-[#F97316]/30";
    case "MEDIUM":
      return "bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30";
    case "LOW":
      return "bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30";
    default:
      return "bg-surface-variant text-on-surface-variant border border-outline-variant";
  }
}

export function statusDotClass(status: DocStatus) {
  if (status === "Completed") return "bg-[#4ADE80]";
  if (status === "Failed") return "bg-error";
  return "bg-primary animate-pulse";
}
