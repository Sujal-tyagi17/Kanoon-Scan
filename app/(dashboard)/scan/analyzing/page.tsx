"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function AnalyzingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");
  
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [legalTip] = useState(() => getRandomLegalTip());

  useEffect(() => {
    if (!documentId) {
      router.push("/scan");
      return;
    }

    // Simulate progress for steps 1-2 (upload and text extraction are already done)
    setProgress(30);
    setCurrentStep(2);

    const timer1 = setTimeout(() => {
      setProgress(60);
      setCurrentStep(3);
    }, 1000);

    // Start actual analysis
    const analyzeDocument = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for UI to show progress
        
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId }),
        });

        if (!response.ok) {
          throw new Error("Analysis failed");
        }

        const { analysisId, data } = await response.json();
        
        // Animate to 100%
        setProgress(100);
        
        // Redirect directly to the analysis report after a brief moment
        setTimeout(() => {
          router.push(`/analysis/${analysisId}`);
        }, 1000);
      } catch (err) {
        console.error("Analysis error:", err);
        setError("Failed to analyze document. Please try again.");
      }
    };

    analyzeDocument();

    return () => {
      clearTimeout(timer1);
    };
  }, [documentId, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#231c0f] overflow-y-auto">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-primary/10 px-6 lg:px-40 py-3 bg-[#231c0f]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">gavel</span>
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-tight">
            KanoonScan
          </h2>
        </div>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-slate-300 hover:text-primary text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/documents"
              className="text-slate-300 hover:text-primary text-sm font-medium transition-colors"
            >
              Documents
            </Link>
            <Link
              href="#"
              className="text-slate-300 hover:text-primary text-sm font-medium transition-colors"
            >
              History
            </Link>
            <Link
              href="#"
              className="text-slate-300 hover:text-primary text-sm font-medium transition-colors"
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

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-4xl mx-auto w-full">
        {/* Large Pulsing Icon Section */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div className="relative flex items-center justify-center size-24 lg:size-32 rounded-full bg-[#231c0f] border-4 border-primary/30 shadow-2xl shadow-primary/20">
            <span className="material-symbols-outlined text-primary text-5xl lg:text-6xl select-none">
              balance
            </span>
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center mb-6">
          <h1 className="text-white text-2xl lg:text-3xl font-bold tracking-tight mb-2">
            Analyzing Legal Document
          </h1>
          <p className="text-slate-400 text-base">
            Our AI is processing your file for compliance and risk factors.
          </p>
        </div>

        {/* Progress Checklist */}
        <div className="w-full max-w-md space-y-3 mb-6">
          {/* Step 1: Upload - Always completed when on this page */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-green-500/5 border border-green-500/20">
            <div className="flex items-center justify-center size-6 rounded-full bg-green-500 text-[#231c0f]">
              <span className="material-symbols-outlined text-base font-bold">check</span>
            </div>
            <span className="text-slate-100 font-medium text-xs">Document Uploaded</span>
          </div>

          {/* Step 2: Text Extraction */}
          <div className={`flex items-center gap-3 p-2.5 rounded-xl ${
            currentStep >= 2
              ? currentStep === 2
                ? "bg-primary/10 border border-primary/30 animate-pulse"
                : "bg-green-500/5 border border-green-500/20"
              : "bg-slate-500/5 border border-slate-500/10 opacity-50"
          }`}>
            <div className={`flex items-center justify-center size-6 rounded-full ${
              currentStep >= 3
                ? "bg-green-500 text-[#231c0f]"
                : currentStep === 2
                ? "bg-primary text-[#231c0f]"
                : "bg-slate-600 text-slate-300"
            }`}>
              <span className={`material-symbols-outlined text-base ${
                currentStep === 2 ? "animate-spin" : currentStep >= 3 ? "font-bold" : ""
              }`}>
                {currentStep >= 3 ? "check" : currentStep === 2 ? "sync" : "hourglass_empty"}
              </span>
            </div>
            <span className={`font-medium text-xs ${
              currentStep >= 2 ? "text-white" : "text-slate-400"
            }`}>
              {currentStep >= 3 ? "Text extracted" : "Extracting text..."}
            </span>
          </div>

          {/* Step 3: Analysis */}
          <div className={`flex items-center gap-3 p-2.5 rounded-xl ${
            currentStep >= 3
              ? currentStep === 3
                ? "bg-primary/10 border border-primary/30 animate-pulse"
                : "bg-green-500/5 border border-green-500/20"
              : "bg-slate-500/5 border border-slate-500/10 opacity-50"
          }`}>
            <div className={`flex items-center justify-center size-6 rounded-full ${
              currentStep > 3
                ? "bg-green-500 text-[#231c0f]"
                : currentStep === 3
                ? "bg-primary text-[#231c0f]"
                : "bg-slate-600 text-slate-300"
            }`}>
              <span className={`material-symbols-outlined text-base ${
                currentStep === 3 ? "animate-spin" : currentStep > 3 ? "font-bold" : ""
              }`}>
                {currentStep > 3 ? "check" : currentStep === 3 ? "sync" : "hourglass_empty"}
              </span>
            </div>
            <span className={`font-medium text-xs ${
              currentStep >= 3 ? "text-white font-semibold" : "text-slate-400"
            }`}>
              {currentStep > 3 ? "Analysis complete" : "Analyzing clauses"}
            </span>
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="w-full max-w-2xl bg-slate-900/40 p-4 rounded-2xl border border-primary/5">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-primary font-bold text-sm">Scanning Progress</p>
              <p className="text-slate-400 text-xs">AI analyzing document structure</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-primary">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-slate-700/30 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(249,160,6,0.5)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex items-start gap-2 p-2.5 bg-primary/5 rounded-lg border-l-4 border-primary italic">
            <span className="material-symbols-outlined text-primary text-base">lightbulb</span>
            <p className="text-slate-400 text-xs leading-relaxed">
              <span className="font-semibold not-italic text-slate-300">Legal Tip:</span> {legalTip}
            </p>
          </div>
        </div>
      </main>

      {/* Footer / Status */}
      <footer className="p-3 text-center">
        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold">
          Secure Analysis
        </p>
      </footer>
    </div>
  );
}
