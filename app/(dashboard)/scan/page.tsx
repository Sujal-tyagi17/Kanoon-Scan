"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import FileUploader from "@/components/scan/FileUploader";

export default function ScanPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeText = async () => {
    if (!pastedText.trim()) {
      setError("Please paste some text to analyze");
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

      if (!response.ok) {
        throw new Error("Failed to process text");
      }

      const { documentId } = await response.json();
      router.push(`/scan/analyzing?documentId=${documentId}`);
    } catch (err) {
      console.error("Error analyzing text:", err);
      setError("Failed to analyze text. Please try again.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        {/* Top Bar */}
        <TopBar />

        {/* Scan page content */}
        <div className="p-8 max-w-4xl mx-auto w-full space-y-gutter">
          {/* Header */}
          <header className="mb-stack-lg">
            <h2 className="font-headline-xl text-headline-xl text-on-background mb-2">Scan New Document</h2>
            <p className="font-body-lg text-on-surface-variant">Upload your contract or legal briefing for institutional-grade AI clause analysis and risk assessment.</p>
          </header>

          {/* Main Upload Card */}
          <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden shadow-2xl">
            {/* Tabs */}
            <div className="p-3 border-b border-outline-variant bg-surface-container-low">
              <div className="flex bg-background/50 p-1 rounded-lg w-full">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md font-bold text-sm transition-all ${
                    activeTab === "upload"
                      ? "bg-secondary-container text-on-secondary-container"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[19px]">cloud_upload</span>
                  Upload Document
                </button>
                <button
                  onClick={() => setActiveTab("paste")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md font-semibold text-sm transition-all ${
                    activeTab === "paste"
                      ? "bg-secondary-container text-on-secondary-container"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[19px]">content_paste</span>
                  Paste Text
                </button>
              </div>
            </div>

            {/* Content Zone */}
            <div className="p-6">
              {activeTab === "paste" ? (
                <div className="space-y-4">
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    className="w-full h-48 rounded-lg bg-[#0b1326]/50 border border-outline-variant p-4 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none font-body-md"
                    placeholder="Paste your legal agreement text here..."
                    disabled={isAnalyzing}
                  />
                  <button
                    onClick={handleAnalyzeText}
                    disabled={isAnalyzing || !pastedText.trim()}
                    className="w-full bg-primary-container hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed text-white h-12 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-95"
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="material-symbols-outlined text-xl animate-spin">sync</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-xl">search_insights</span>
                        Analyze Text
                      </>
                    )}
                  </button>
                  {error && (
                    <div className="p-3 bg-error-container/10 border border-error-container/20 rounded-lg text-error text-xs flex items-start gap-2">
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

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-3xl">encrypted</span>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary font-data-label">
                  Security
                </span>
                <span className="text-xs font-semibold text-on-surface">AES-256 Encrypted</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-3xl">visibility_off</span>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary font-data-label">
                  Privacy
                </span>
                <span className="text-xs font-semibold text-on-surface">Zero-Knowledge Storage</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary font-data-label">
                  Latency
                </span>
                <span className="text-xs font-semibold text-on-surface">Results in ~14s</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
