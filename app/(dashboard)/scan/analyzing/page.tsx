"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";

const LEGAL_TIPS = [
  "Always ensure that arbitration clauses specify the governing law and jurisdiction to avoid ambiguity in cross-border disputes.",
  "Review confidentiality clauses carefully - they may restrict your ability to discuss the agreement even after termination.",
  "Indemnity clauses can transfer significant financial risk. Ensure the scope is clear and reasonable for both parties.",
  "Automatic renewal clauses can be binding. Always check the notice period required to prevent unwanted renewals.",
  "Force majeure clauses may not cover all unforeseen events. Consider adding specific provisions for pandemics or cyber attacks.",
  "Non-compete clauses should be reasonable in scope, duration, and geographic area to be enforceable in most jurisdictions.",
  "Payment terms should clearly specify due dates, late payment penalties, and the currency to avoid disputes.",
  "Intellectual property ownership should be explicitly stated, especially for work created during the contract period.",
  "Termination clauses should outline clear exit conditions and notice periods to protect both parties' interests.",
  "Liability caps may limit your ability to recover damages. Ensure they align with the potential risks involved."
];

function getRandomLegalTip() {
  return LEGAL_TIPS[Math.floor(Math.random() * LEGAL_TIPS.length)];
}

function AnalyzingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [legalTip] = useState(() => getRandomLegalTip());

  const startedRef = useRef(false);
  const [attempt, setAttempt] = useState(0);

  const runAnalysis = useCallback(async () => {
    if (!documentId) return;
    setError(null);
    setErrorDetail(null);
    setProgress(30);
    setCurrentStep(2);

    // Smoothly creep the bar while the model works, without ever claiming 100%.
    const creep = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.max(0.5, (90 - p) / 25) : p));
      setCurrentStep(3);
    }, 400);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(`/scan/analyzing?documentId=${documentId}`)}`);
        return;
      }
      if (!response.ok || !data.analysisId) {
        if (data.reason) setErrorDetail(String(data.reason));
        throw new Error(
          response.status === 404
            ? "We couldn't find this document. It may have been deleted."
            : data.error || "Analysis failed"
        );
      }

      setProgress(100);
      setCurrentStep(4);
      setTimeout(() => router.replace(`/analysis/${data.analysisId}`), 600);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(
        err?.message && err.message !== "Analysis failed"
          ? err.message
          : "The AI couldn't finish analysing this document. This is usually temporary — please try again."
      );
    } finally {
      clearInterval(creep);
    }
  }, [documentId, router]);

  useEffect(() => {
    if (!documentId) {
      router.replace("/scan");
      return;
    }
    // Guard against React strict-mode double invocation firing two analyses.
    if (startedRef.current && attempt === 0) return;
    startedRef.current = true;
    runAnalysis();
  }, [documentId, router, runAnalysis, attempt]);

  const stepConfig = [
    { label: "Document Uploaded", doneLabel: "Document Uploaded", icon: "cloud_done" },
    { label: "Extracting text...", doneLabel: "Text extracted", icon: "text_snippet" },
    { label: "Analyzing clauses", doneLabel: "Analysis complete", icon: "psychology" },
  ];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-outline-variant px-6 lg:px-40 py-3 bg-surface-container/80 backdrop-blur-md shrink-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo />
          <h2 className="text-on-background text-lg font-bold leading-tight tracking-tight">
            KanoonScan
          </h2>
        </Link>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-on-surface-variant hover:text-primary text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/vault"
              className="text-on-surface-variant hover:text-primary text-sm font-medium transition-colors"
            >
              Documents
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-on-surface-variant hover:text-primary text-sm font-medium transition-colors"
            >
              Settings
            </Link>
          </nav>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-9 rounded-full border-2 border-primary/20",
              },
            }}
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-4 max-w-5xl mx-auto w-full overflow-hidden">
        {/* Animated Scanner Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div className="relative flex items-center justify-center size-20 lg:size-24 rounded-full bg-surface-container border-2 border-primary/20 shadow-2xl shadow-primary/10">
            {/* Orbiting ring */}
            <div className="absolute inset-[-6px] rounded-full border-2 border-dashed border-primary/20 animate-[spin_8s_linear_infinite]"></div>
            <div className="absolute inset-[-12px] rounded-full border border-dashed border-tertiary/10 animate-[spin_12s_linear_infinite_reverse]"></div>
            <span className="material-symbols-outlined text-primary text-3xl lg:text-4xl select-none animate-pulse">
              policy
            </span>
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center mb-6">
          <h1 className="text-on-background text-xl lg:text-2xl font-bold tracking-tight mb-1">
            Analyzing Legal Document
          </h1>
          <p className="text-on-surface-variant text-sm">
            Our AI is processing your file for compliance and risk factors.
          </p>
        </div>

        {error && (
          <div className="w-full max-w-md mb-4 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm text-center shrink-0">
            <span className="material-symbols-outlined text-base mr-2 align-middle">error</span>
            {error}
            {errorDetail && (
              <details className="mt-2 text-left text-[11px] text-on-surface-variant">
                <summary className="cursor-pointer text-center">Technical details</summary>
                <p className="mt-1 font-data-mono break-words">{errorDetail}</p>
              </details>
            )}
            <div className="flex justify-center gap-3 mt-3">
              <button onClick={() => setAttempt((a) => a + 1)} className="btn-primary !py-2">
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Try again
              </button>
              <Link href="/scan" className="btn-secondary !py-2">Scan another</Link>
            </div>
          </div>
        )}

        {/* Side-by-Side Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch max-w-4xl mb-6">
          {/* Progress Checklist */}
          <div className="space-y-3 flex flex-col justify-center bg-surface-container/30 p-5 rounded-2xl border border-outline-variant/50">
            <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1 font-data-label">Analysis Steps</p>
            {stepConfig.map((step, index) => {
              const stepNum = index + 1;
              const isDone = currentStep > stepNum || (stepNum === 1);
              const isActive = currentStep === stepNum && stepNum !== 1;

              return (
                <div
                  key={stepNum}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-500 ${isDone
                      ? "bg-tertiary/5 border border-tertiary/15"
                      : isActive
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-surface-container-low border border-outline-variant/10 opacity-30"
                    }`}
                >
                  <div
                    className={`flex items-center justify-center size-6 rounded-full transition-all duration-300 ${isDone
                        ? "bg-tertiary text-background"
                        : isActive
                          ? "bg-primary text-background"
                          : "bg-outline/30 text-on-surface-variant"
                      }`}
                  >
                    <span
                      className={`material-symbols-outlined text-xs ${isActive ? "animate-spin" : isDone ? "font-bold" : ""
                        }`}
                    >
                      {isDone ? "check" : isActive ? "sync" : "hourglass_empty"}
                    </span>
                  </div>
                  <span
                    className={`font-medium text-xs ${isDone
                        ? "text-tertiary"
                        : isActive
                          ? "text-on-background font-semibold"
                          : "text-on-surface-variant"
                      }`}
                  >
                    {isDone ? step.doneLabel : step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar & Legal Tip */}
          <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-primary font-bold text-xs">Scanning Progress</p>
                  <p className="text-on-surface-variant text-[10px]">AI analyzing document structure</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary tabular-nums">{Math.round(progress)}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-surface-container-low rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full shadow-[0_0_15px_rgba(255,200,128,0.4)] transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Legal Tip */}
            <div className="flex items-start gap-2.5 p-3 bg-primary/5 rounded-xl border-l-4 border-primary">
              <span className="material-symbols-outlined text-primary text-sm mt-0.5">lightbulb</span>
              <p className="text-on-surface-variant text-[11px] leading-relaxed italic">
                <span className="font-semibold not-italic text-on-surface">Legal Tip:</span> {legalTip}
              </p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 text-on-surface-variant/45 shrink-0">
          <span className="material-symbols-outlined text-xs">lock</span>
          <p className="text-[9px] uppercase tracking-[0.15em] font-semibold">
            AES-256 Encrypted · Zero-Knowledge Processing
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AnalyzingPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-background" />}>
      <AnalyzingContent />
    </Suspense>
  );
}
