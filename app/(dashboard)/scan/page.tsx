"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/dashboard/AppShell";
import FileUploader from "@/components/scan/FileUploader";

const MIN_CHARS = 50;

export default function ScanPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chars = pastedText.trim().length;

  const handleAnalyzeText = async () => {
    if (chars < MIN_CHARS) {
      setError(`Please paste at least ${MIN_CHARS} characters of the agreement.`);
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pastedText }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        router.push("/sign-in?redirect_url=/scan");
        return;
      }
      if (!response.ok) throw new Error(data.error || "Failed to process text");
      router.push(`/scan/analyzing?documentId=${data.documentId}`);
    } catch (err: any) {
      setError(err.message || "Failed to analyse text. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const tabCls = (active: boolean) =>
    `flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all focus-ring ${
      active ? "bg-primary/15 text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
    }`;

  return (
    <AppShell title="New Scan" showScanButton={false}>
      <div className="p-4 sm:p-8 max-w-3xl mx-auto w-full space-y-6">
        <header>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-background">Scan a document</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Upload a contract or paste its text. You&apos;ll get a risk score, flagged clauses and a plain-English summary.
          </p>
        </header>

        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden shadow-2xl">
          <div className="p-3 border-b border-outline-variant bg-surface-container-low">
            <div className="flex bg-background/50 p-1 rounded-lg" role="tablist">
              <button role="tab" aria-selected={activeTab === "upload"} onClick={() => setActiveTab("upload")} className={tabCls(activeTab === "upload")}>
                <span className="material-symbols-outlined text-[19px]">cloud_upload</span>
                Upload file
              </button>
              <button role="tab" aria-selected={activeTab === "paste"} onClick={() => setActiveTab("paste")} className={tabCls(activeTab === "paste")}>
                <span className="material-symbols-outlined text-[19px]">content_paste</span>
                Paste text
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "paste" ? (
              <div className="space-y-3">
                <textarea
                  value={pastedText}
                  onChange={(e) => {
                    setPastedText(e.target.value);
                    if (error) setError(null);
                  }}
                  className="field h-64 resize-y leading-relaxed"
                  placeholder="Paste your agreement text here…"
                  disabled={isAnalyzing}
                  aria-label="Agreement text"
                />
                <div className="flex justify-between text-xs text-outline">
                  <span>{chars < MIN_CHARS ? `At least ${MIN_CHARS} characters` : "Looks good"}</span>
                  <span className="tabular-nums">{chars.toLocaleString()} characters</span>
                </div>
                <button onClick={handleAnalyzeText} disabled={isAnalyzing || chars < MIN_CHARS} className="btn-primary w-full h-12">
                  <span className={`material-symbols-outlined text-xl ${isAnalyzing ? "animate-spin" : ""}`}>
                    {isAnalyzing ? "progress_activity" : "search_insights"}
                  </span>
                  {isAnalyzing ? "Preparing…" : "Analyse text"}
                </button>
                {error && (
                  <div role="alert" className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm flex items-start gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    <p>{error}</p>
                  </div>
                )}
              </div>
            ) : (
              <FileUploader />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "encrypted", label: "Security", text: "Text encrypted at rest" },
            { icon: "delete_forever", label: "Control", text: "Delete any time" },
            { icon: "bolt", label: "Speed", text: "Usually under a minute" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/40">
              <span className="material-symbols-outlined text-primary text-2xl">{b.icon}</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary font-data-label">{b.label}</p>
                <p className="text-xs font-semibold text-on-surface">{b.text}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-outline text-center">
          KanoonScan gives AI-generated guidance, not legal advice. Consult a lawyer before signing anything important.
        </p>
      </div>
    </AppShell>
  );
}
