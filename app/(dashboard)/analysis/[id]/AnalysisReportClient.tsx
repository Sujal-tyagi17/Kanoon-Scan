"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { Analysis, Document, Clause, RiskCategory } from "@/types/db";
import Logo from "@/components/Logo";

type AnalysisWithRelations = Analysis & {
  document: Document;
  clauses: Clause[];
  categories: RiskCategory[];
};

export default function AnalysisReportClient({ analysisData }: { analysisData: AnalysisWithRelations }) {
  const [activeTab, setActiveTab] = useState<"all" | "high" | "plain" | "saved">("all");

  const document = analysisData.document;
  const clauses = analysisData.clauses;
  const categories = analysisData.categories;

  // Filter clauses based on active tab
  const filteredClauses = clauses.filter((clause) => {
    if (activeTab === "all") return true;
    if (activeTab === "high") return clause.riskLevel === "HIGH" || clause.riskLevel === "CRITICAL";
    if (activeTab === "saved") return clause.isSaved;
    return true; // "plain" tab handled separately
  });

  const highRiskCount = clauses.filter((c) => c.riskLevel === "HIGH" || c.riskLevel === "CRITICAL").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1326] text-on-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-outline-variant px-8 py-3 bg-[#0b1326] sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Logo className="w-8 h-8" />
          <div>
            <h2 className="text-md font-extrabold leading-tight tracking-tight text-primary">
              KanoonScan
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant truncate max-w-xs">{document.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-[9px] font-bold text-primary uppercase tracking-widest border border-primary/20">
                Processed
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 mr-4 border-r border-outline-variant pr-6">
            <Link
              href="/dashboard"
              className="text-on-surface-variant hover:text-primary text-sm font-semibold transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-primary text-sm font-semibold">Analysis Workbench</span>
            <Link
              href="/vault"
              className="text-on-surface-variant hover:text-primary text-sm font-semibold transition-colors"
            >
              Document Vault
            </Link>
          </nav>
          <div className="flex gap-2">
            <button className="flex items-center justify-center rounded-lg h-9 w-9 bg-surface-container border border-outline-variant text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">share</span>
            </button>
            <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-primary-container text-white font-semibold text-sm hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                Export Report
              </span>
            </button>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-9 rounded-full ring-2 ring-primary/20",
              },
            }}
          />
        </div>
      </header>

      {/* Critical Risk Banner */}
      {highRiskCount > 0 && (
        <div className="bg-error-container/10 border-b border-error-container/30 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-error">
            <span className="material-symbols-outlined fill-1">warning</span>
            <span className="text-sm font-semibold">
              Critical Risk Detected: This document contains {highRiskCount} high-risk clauses that may impact your legal standing.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase">Risk Score</span>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white font-bold text-sm shadow-lg ${analysisData.riskScore > 70 ? 'bg-error-container border border-error/20' : 'bg-primary-container border border-primary/20'}`}>
              {analysisData.riskScore}/100
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Document View */}
        <section className="w-1/3 border-r border-outline-variant flex flex-col bg-surface-container-lowest/30">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-data-label">
              Document Text
            </h3>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-surface-container rounded transition-colors text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-sm">zoom_in</span>
              </button>
              <button className="p-1 hover:bg-surface-container rounded transition-colors text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-sm">zoom_out</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar leading-relaxed font-legal-text text-on-surface/90">
            <h1 className="text-xl font-bold mb-6 text-on-surface border-b border-outline-variant pb-4">{document.name}</h1>
            <div className="whitespace-pre-wrap selection:bg-primary/20">
              {document.rawText || analysisData.summary}
            </div>
          </div>
        </section>

        {/* Risk Overview */}
        <section className="w-1/4 border-r border-outline-variant flex flex-col bg-surface-container-low/20">
          <div className="p-6">
            <h3 className="text-sm font-semibold mb-8 text-on-surface font-headline-md">Risk Profile</h3>
            <div className="relative size-44 mx-auto mb-10">
              <svg className="size-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-[#2d3449]"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="40"
                  strokeWidth="6"
                ></circle>
                <circle
                  className={`stroke-current ${analysisData.riskScore > 70 ? 'text-error' : analysisData.riskScore > 40 ? 'text-primary' : 'text-tertiary'}`}
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="40"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * analysisData.riskScore) / 100}
                  strokeLinecap="round"
                  strokeWidth="8"
                  transform="rotate(-90 50 50)"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-headline-xl ${analysisData.riskScore > 70 ? 'text-error' : 'text-primary'}`}>
                  {analysisData.riskScore}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-data-label">
                  {analysisData.riskLevel} Risk
                </span>
              </div>
            </div>
            
            {/* dynamic Categories */}
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-on-surface-variant">{category.name}</span>
                    <span className={`text-xs font-bold font-data-label ${
                      category.level === "HIGH" || category.level === "CRITICAL" ? "text-error" :
                      category.level === "MEDIUM" ? "text-primary" :
                      "text-tertiary"
                    }`}>
                      {category.level}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#2d3449] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        category.level === "HIGH" || category.level === "CRITICAL" ? "bg-error" :
                        category.level === "MEDIUM" ? "bg-primary" :
                        "bg-tertiary"
                      }`}
                      style={{ width: `${category.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-4 bg-primary-container/10 rounded-xl border border-primary/20">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
                <div>
                  <p className="text-xs font-bold text-primary uppercase mb-1 tracking-wider font-data-label">
                    AI Recommendation
                  </p>
                  <p className="text-xs leading-relaxed text-on-surface-variant">
                     Review the clauses highlighted in the "High Risk" tab. Consider requesting revisions for any terms scoring high liability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clause Details */}
        <section className="flex-1 flex flex-col bg-[#0b1326] overflow-hidden">
          <div className="p-4 border-b border-outline-variant flex flex-col gap-4 bg-surface-container-low/50">
            <div className="flex items-center justify-between">
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`text-sm pb-1 whitespace-nowrap transition-colors ${
                    activeTab === "all"
                      ? "font-bold border-b-2 border-primary text-on-surface"
                      : "font-semibold text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  All Issues ({clauses.length})
                </button>
                <button
                  onClick={() => setActiveTab("high")}
                  className={`text-sm pb-1 whitespace-nowrap transition-colors ${
                    activeTab === "high"
                      ? "font-bold border-b-2 border-primary text-on-surface"
                      : "font-semibold text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  High Risk ({highRiskCount})
                </button>
                <button
                  onClick={() => setActiveTab("plain")}
                  className={`text-sm pb-1 whitespace-nowrap transition-colors ${
                    activeTab === "plain"
                      ? "font-bold border-b-2 border-primary text-on-surface"
                      : "font-semibold text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Plain English
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`text-sm pb-1 whitespace-nowrap transition-colors ${
                    activeTab === "saved"
                      ? "font-bold border-b-2 border-primary text-on-surface"
                      : "font-semibold text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Saved Clauses
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant font-data-label">Sort:</span>
                <select className="text-xs font-semibold bg-transparent border-none focus:ring-0 p-0 pr-4 cursor-pointer text-on-surface outline-none">
                  <option className="bg-[#0b1326]">Risk Level</option>
                  <option className="bg-[#0b1326]">Clause Order</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            
            {activeTab === "plain" ? (
              <div className="p-6 bg-surface-container border border-outline-variant rounded-xl">
                 <h3 className="text-md font-bold text-on-surface mb-4">Plain English Summary</h3>
                 <div className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap font-legal-text">
                    {analysisData.plainEnglish}
                 </div>
              </div>
            ) : filteredClauses.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-4 opacity-50">task_alt</span>
                  <p>No clauses match the current filter.</p>
               </div>
            ) : filteredClauses.map((clause) => {
              const _isCritical = clause.riskLevel === "CRITICAL";
              const _isHigh = clause.riskLevel === "HIGH";
              const _isMedium = clause.riskLevel === "MEDIUM";

              return (
                <div key={clause.id} className={`bg-surface-container border border-outline-variant rounded-xl overflow-hidden shadow-sm transition-all hover:border-primary/30 ${
                    _isCritical || _isHigh ? "legal-card-border-risk" : 
                    _isMedium ? "legal-card-border-caution" : 
                    "legal-card-border-verified"
                 }`}>
                  <div className={`p-4 border-b border-outline-variant/30 flex justify-between items-center ${
                    _isCritical || _isHigh ? "bg-error-container/5" : 
                    _isMedium ? "bg-primary-container/5" : 
                    "bg-tertiary/5"
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-data-label uppercase ${
                        _isCritical || _isHigh ? "bg-error text-[#690005]" : 
                        _isMedium ? "bg-primary text-[#002a78]" : 
                        "bg-tertiary text-[#003824]"
                      }`}>
                        {clause.riskLevel}
                      </span>
                      <h4 className="text-sm font-bold text-on-surface">
                        {clause.title}
                      </h4>
                    </div>
                    <button className={`material-symbols-outlined hover:text-primary transition-colors ${_clauseSavedState(clause) ? "text-primary" : "text-on-surface-variant"}`}>
                      {_clauseSavedState(clause) ? "bookmark" : "bookmark_add"}
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 font-data-label">
                        Original Text
                      </p>
                      <p className="text-sm text-on-surface-variant italic mb-4 border-l-2 border-outline-variant pl-3 leading-relaxed font-legal-text">
                        "{clause.originalText}"
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 font-data-label">
                        What this means
                      </p>
                      <p className="text-sm text-on-surface leading-relaxed">
                        {clause.explanation}
                      </p>
                    </div>

                    {clause.whyRisky && clause.whyRisky.trim() !== "" && (
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 font-data-label">
                          Why it's risky
                        </p>
                        <p className="text-sm text-on-surface leading-relaxed">
                          {clause.whyRisky}
                        </p>
                      </div>
                    )}
                    
                    {clause.suggestion && clause.suggestion.trim() !== "None" && clause.suggestion.trim() !== "" && (
                      <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/50">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 font-data-label">
                          Ask for instead
                        </p>
                        <p className="text-sm italic text-on-surface-variant leading-relaxed">
                          "{clause.suggestion}"
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end pt-2 border-t border-outline-variant/20">
                      <button className="text-xs font-semibold px-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant hover:bg-surface-variant/30 transition-colors text-on-surface">
                        Generate Draft
                      </button>
                      <button className="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-[#002a78] hover:shadow-[0_0_10px_rgba(180,197,255,0.3)] transition-all">
                        Accept Change
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Chat Bar */}
            <div className="sticky bottom-0 bg-gradient-to-t from-[#0b1326] pt-8 pb-4">
              <div className="bg-surface-container border border-outline-variant p-2 rounded-xl flex items-center gap-4 shadow-xl">
                <div className="size-10 rounded-lg bg-primary-container flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm flex-1 placeholder:text-outline text-on-surface outline-none"
                  placeholder="Ask KanoonScan AI about these clauses..."
                  type="text"
                />
                <button className="size-10 rounded-lg bg-primary text-[#002a78] flex items-center justify-center hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-lg">send</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container border-t border-outline-variant px-8 py-2.5 flex items-center justify-between text-[10px] font-semibold text-on-surface-variant shrink-0 z-50 relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-tertiary"></div>
            <span>Analysis Complete</span>
          </div>
          <span>v4.2.1 Stable</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-primary">
            Legal Terms
          </Link>
          <Link href="#" className="hover:text-primary">
            Contact Support
          </Link>
          <span>Last scanned: just now</span>
        </div>
      </footer>
    </div>
  );
}

// Stub saved state check
function _clauseSavedState(clause: Clause) {
  return clause.isSaved || false;
}
