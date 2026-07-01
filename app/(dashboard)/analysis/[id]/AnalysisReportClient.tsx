"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useState, useRef } from "react";
import { Analysis, Document, Clause, RiskCategory } from "@/types/db";
import Logo from "@/components/Logo";

type AnalysisWithRelations = Analysis & {
  document: Document;
  clauses: Clause[];
  categories: RiskCategory[];
};

export default function AnalysisReportClient({ analysisData }: { analysisData: AnalysisWithRelations }) {
  // Sort state
  const [sortBy, setSortBy] = useState<"Risk Level" | "Clause Order">("Risk Level");
  const [activeTab, setActiveTab] = useState<"all" | "high" | "plain" | "saved">("all");

  // Local state for saved/bookmarked clauses
  const [savedClauses, setSavedClauses] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    analysisData.clauses.forEach((c) => {
      if (c.isSaved) {
        initial.add(c.id || c._id);
      }
    });
    return initial;
  });

  // Toggle clause saved status
  const handleToggleSave = async (clause: any) => {
    const clauseId = clause.id || clause._id;
    const isCurrentlySaved = savedClauses.has(clauseId);
    
    // Optimistic update
    setSavedClauses((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) {
        next.delete(clauseId);
      } else {
        next.add(clauseId);
      }
      return next;
    });

    try {
      const res = await fetch("/api/clauses/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clauseId,
          isSaved: !isCurrentlySaved,
        }),
      });
      if (!res.ok) {
        // Revert on error
        setSavedClauses((prev) => {
          const next = new Set(prev);
          if (isCurrentlySaved) {
            next.add(clauseId);
          } else {
            next.delete(clauseId);
          }
          return next;
        });
      }
    } catch (err) {
      // Revert on error
      setSavedClauses((prev) => {
        const next = new Set(prev);
        if (isCurrentlySaved) {
          next.add(clauseId);
        } else {
          next.delete(clauseId);
        }
        return next;
      });
    }
  };

  // Draft generation state
  const [draftClauseId, setDraftClauseId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<string>("");
  const [draftLoading, setDraftLoading] = useState(false);

  // Accept change state
  const [acceptedClauses, setAcceptedClauses] = useState<Set<string>>(new Set());

  // AI Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; message: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Generate Draft handler
  const handleGenerateDraft = async (clause: any) => {
    const clauseId = clause.id || clause._id;
    setDraftClauseId(clauseId);
    setDraftLoading(true);
    setDraftText("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: analysisData.id || analysisData._id,
          message: `Generate an improved, fairer alternative clause to replace this risky clause. Return ONLY the replacement clause text, no explanation.\n\nOriginal clause: "${clause.originalText}"\n\nRisk: ${clause.whyRisky}\nSuggestion: ${clause.suggestion}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDraftText(data.message || "Failed to generate draft.");
      } else {
        setDraftText("Error: Could not generate draft. Please try again.");
      }
    } catch (e) {
      setDraftText("Error: Network failure. Please try again.");
    } finally {
      setDraftLoading(false);
    }
  };

  // Accept change handler
  const handleAcceptChange = (clause: any) => {
    const clauseId = clause.id || clause._id;
    setAcceptedClauses((prev) => {
      const next = new Set(prev);
      next.add(clauseId);
      return next;
    });
  };

  // Export Report handler
  const handleExportReport = () => {
    const riskColor = (level: string) => {
      if (level === "CRITICAL" || level === "HIGH") return "#ff4444";
      if (level === "MEDIUM") return "#ff9900";
      return "#22c55e";
    };

    const clauseRows = clauses.map((c, i) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #eee;">${i + 1}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;font-weight:600;">${c.title}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;">
          <span style="background:${riskColor(c.riskLevel)};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;">${c.riskLevel}</span>
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee;font-size:13px;">${c.explanation || ""}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;font-size:13px;font-style:italic;color:#555;">${c.suggestion || "—"}</td>
      </tr>
    `).join("");

    const categoryRows = categories.map(cat => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;font-weight:500;">${cat.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">
          <span style="background:${riskColor(cat.level)};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;">${cat.level}</span>
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;font-weight:700;">${cat.score}/100</td>
      </tr>
    `).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>KanoonScan Analysis Report - ${document.name}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; margin:0; padding:40px; color:#1a1a2e; background:#fff; }
    .header { display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #f5a623; padding-bottom:20px; margin-bottom:30px; }
    .logo { font-size:24px; font-weight:800; color:#f5a623; }
    .meta { text-align:right; font-size:12px; color:#666; }
    .risk-badge { display:inline-block; padding:6px 16px; border-radius:8px; font-weight:800; font-size:18px; color:#fff; }
    .risk-high { background:#ffb4ab; color:#690005; }
    .risk-medium { background:#f5a623; color:#472a00; }
    .risk-low { background:#d6b400; color:#221b00; }
    h2 { color:#f5a623; border-bottom:1px solid #e5e7eb; padding-bottom:8px; margin-top:30px; }
    table { width:100%; border-collapse:collapse; margin-top:10px; }
    th { background:#f1f5f9; padding:10px; text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:#475569; border-bottom:2px solid #e2e8f0; }
    .summary-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; margin:15px 0; line-height:1.7; }
    .footer { margin-top:40px; padding-top:15px; border-top:2px solid #e5e7eb; font-size:11px; color:#999; text-align:center; }
    @media print { body { padding:20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">⚖ KanoonScan</div>
      <div style="font-size:13px;color:#64748b;margin-top:4px;">AI-Powered Legal Document Analysis Report</div>
    </div>
    <div class="meta">
      <div><strong>Document:</strong> ${document.name}</div>
      <div><strong>Analyzed:</strong> ${new Date(analysisData.createdAt).toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" })}</div>
      <div style="margin-top:8px;"><span class="risk-badge ${analysisData.riskScore > 70 ? 'risk-high' : analysisData.riskScore > 40 ? 'risk-medium' : 'risk-low'}">Risk Score: ${analysisData.riskScore}/100</span></div>
    </div>
  </div>

  <h2>Executive Summary</h2>
  <div class="summary-box">${analysisData.summary}</div>

  ${analysisData.plainEnglish ? `<h2>Plain English Translation</h2><div class="summary-box">${analysisData.plainEnglish}</div>` : ""}

  <h2>Risk Categories</h2>
  <table>
    <thead><tr><th>Category</th><th style="text-align:center;">Risk Level</th><th style="text-align:center;">Score</th></tr></thead>
    <tbody>${categoryRows}</tbody>
  </table>

  <h2>Clause Analysis (${clauses.length} Clauses)</h2>
  <table>
    <thead><tr><th>#</th><th>Clause</th><th>Risk</th><th>Explanation</th><th>Recommendation</th></tr></thead>
    <tbody>${clauseRows}</tbody>
  </table>

  <div class="footer">
    <p>Generated by KanoonScan &mdash; AI Legal Document Scanner &mdash; ${new Date().toISOString()}</p>
    <p>This report is for informational purposes only and does not constitute legal advice.</p>
  </div>
</body>
</html>`;

    // Create an iframe to render the content and invoke print to save as PDF
    const iframe = window.document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    window.document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        // Delay removal to let print dialog open
        setTimeout(() => {
          window.document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  };

  // Share handler
  const [shareToast, setShareToast] = useState(false);
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `KanoonScan Report: ${document.name}`,
          text: `Legal analysis of "${document.name}" — Risk Score: ${analysisData.riskScore}/100`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  // AI Chat handler
  const handleSendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "USER", message: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: analysisData.id || analysisData._id,
          message: msg,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: "ASSISTANT", message: data.message }]);
      } else {
        setChatMessages((prev) => [...prev, { role: "ASSISTANT", message: "Sorry, I couldn't process that. Please try again." }]);
      }
    } catch (e) {
      setChatMessages((prev) => [...prev, { role: "ASSISTANT", message: "Network error. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Zoom state
  const [zoomScale, setZoomScale] = useState(1.0);

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.15, 2.0));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.15, 0.7));
  };

  const document = analysisData.document;
  const clauses = analysisData.clauses;
  const categories = analysisData.categories;

  // Filter clauses based on active tab
  const filteredClauses = clauses
    .filter((clause) => {
      const clauseId = clause.id || clause._id;
      if (activeTab === "all") return true;
      if (activeTab === "high") return clause.riskLevel === "HIGH" || clause.riskLevel === "CRITICAL";
      if (activeTab === "saved") return savedClauses.has(clauseId);
      return true; // "plain" tab handled separately
    })
    .sort((a, b) => {
      if (sortBy === "Clause Order") {
        return (a.position ?? 0) - (b.position ?? 0);
      }
      // Sort by risk severity level order: CRITICAL > HIGH > MEDIUM > LOW
      const severity: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aSev = severity[a.riskLevel] || 0;
      const bSev = severity[b.riskLevel] || 0;
      return bSev - aSev; // Descending risk
    });

  const highRiskCount = clauses.filter((c) => c.riskLevel === "HIGH" || c.riskLevel === "CRITICAL").length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-outline-variant px-8 py-3 bg-background sticky top-0 z-50 relative">
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

        {/* Centered Navigation */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6">
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

        <div className="flex items-center gap-4">
          <div className="flex gap-2 relative">
            <button
              onClick={handleShare}
              className="flex items-center justify-center rounded-lg h-9 w-9 bg-surface-container border border-outline-variant text-on-surface-variant hover:text-primary transition-colors"
              title="Share report link"
            >
              <span className="material-symbols-outlined text-lg">share</span>
            </button>
            <button
              onClick={handleExportReport}
              className="flex items-center justify-center rounded-lg h-9 px-4 bg-primary-container text-white font-semibold text-sm hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                Export Report
              </span>
            </button>
            {/* Share toast */}
            {shareToast && (
              <div className="absolute top-12 right-0 bg-tertiary text-[#003824] text-xs font-bold px-4 py-2 rounded-lg shadow-xl animate-in fade-in z-50 whitespace-nowrap">
                ✓ Link copied to clipboard!
              </div>
            )}
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
              <button 
                onClick={handleZoomIn}
                className="p-1 hover:bg-surface-container rounded transition-colors text-on-surface-variant hover:text-primary"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-sm">zoom_in</span>
              </button>
              <button 
                onClick={handleZoomOut}
                className="p-1 hover:bg-surface-container rounded transition-colors text-on-surface-variant hover:text-primary"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-sm">zoom_out</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar leading-relaxed font-legal-text text-on-surface/90">
            <h1 className="text-xl font-bold mb-6 text-on-surface border-b border-outline-variant pb-4">{document.name}</h1>
            <div 
              className="whitespace-pre-wrap selection:bg-primary/20 transition-all duration-200"
              style={{ fontSize: `${zoomScale * 14}px`, lineHeight: `${zoomScale * 1.6}rem` }}
            >
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
        <section className="flex-1 flex flex-col bg-background overflow-hidden">
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
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-semibold bg-background border border-outline-variant/30 rounded px-2 py-1 cursor-pointer text-on-surface outline-none focus:border-primary"
                >
                  <option value="Risk Level">Risk Level</option>
                  <option value="Clause Order">Clause Order</option>
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
                    <button
                      onClick={() => handleToggleSave(clause)}
                      className={`material-symbols-outlined hover:text-primary transition-colors ${savedClauses.has(clause.id || clause._id) ? "text-primary fill-1" : "text-on-surface-variant"}`}
                    >
                      {savedClauses.has(clause.id || clause._id) ? "bookmark" : "bookmark_add"}
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

                    {/* Draft panel */}
                    {draftClauseId === (clause.id || clause._id) && (draftLoading || draftText) && (
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 font-data-label">AI Generated Draft</p>
                        {draftLoading ? (
                          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                            <span className="material-symbols-outlined animate-spin text-primary text-base">sync</span>
                            Generating improved clause...
                          </div>
                        ) : (
                          <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{draftText}</p>
                        )}
                      </div>
                    )}

                    {/* Accepted badge */}
                    {acceptedClauses.has(clause.id || clause._id) && (
                      <div className="flex items-center gap-2 p-3 bg-tertiary/10 rounded-lg border border-tertiary/20">
                        <span className="material-symbols-outlined text-tertiary text-base">check_circle</span>
                        <span className="text-xs font-semibold text-tertiary">Change accepted — clause marked for revision</span>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end pt-2 border-t border-outline-variant/20">
                      <button
                        onClick={() => handleGenerateDraft(clause)}
                        disabled={draftLoading && draftClauseId === (clause.id || clause._id)}
                        className="text-xs font-semibold px-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant hover:bg-surface-variant/30 transition-colors text-on-surface disabled:opacity-50"
                      >
                        {draftLoading && draftClauseId === (clause.id || clause._id) ? "Generating..." : "Generate Draft"}
                      </button>
                      <button
                        onClick={() => handleAcceptChange(clause)}
                        disabled={acceptedClauses.has(clause.id || clause._id)}
                        className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                          acceptedClauses.has(clause.id || clause._id)
                            ? "bg-tertiary/20 text-tertiary cursor-default"
                            : "bg-primary text-[#002a78] hover:shadow-[0_0_10px_rgba(180,197,255,0.3)]"
                        }`}
                      >
                        {acceptedClauses.has(clause.id || clause._id) ? "✓ Accepted" : "Accept Change"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Chat Bar */}
            <div className="sticky bottom-0 bg-gradient-to-t from-background pt-4 pb-4">
              {/* Chat messages */}
              {chatMessages.length > 0 && (
                <div className="mb-3 max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 items-start ${
                        msg.role === "USER" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "ASSISTANT" && (
                        <div className="size-6 rounded bg-primary-container flex items-center justify-center text-white shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-xs">smart_toy</span>
                        </div>
                      )}
                      <div
                        className={`text-xs leading-relaxed px-3 py-2 rounded-lg max-w-[80%] ${
                          msg.role === "USER"
                            ? "bg-primary/15 text-on-surface border border-primary/20"
                            : "bg-surface-container border border-outline-variant text-on-surface-variant"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-2 items-center">
                      <div className="size-6 rounded bg-primary-container flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">Thinking...</span>
                    </div>
                  )}
                </div>
              )}
              <div className="bg-surface-container border border-outline-variant p-2 rounded-xl flex items-center gap-4 shadow-xl">
                <div className="size-10 rounded-lg bg-primary-container flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <input
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendChat(); }}
                  className="bg-transparent border-none focus:ring-0 text-sm flex-1 placeholder:text-outline text-on-surface outline-none"
                  placeholder="Ask KanoonScan AI about these clauses..."
                  type="text"
                  disabled={chatLoading}
                />
                <button
                  onClick={handleSendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="size-10 rounded-lg bg-primary text-[#002a78] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                >
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
