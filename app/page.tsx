"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Logo from "@/components/Logo";
import ShaderBackground from "@/components/ShaderBackground";
import Doc3DAnimation from "@/components/Doc3DAnimation";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b1326] text-on-background font-body-md selection:bg-primary/30 selection:text-on-primary">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0b1326]/70 backdrop-blur-md border-b border-outline-variant/30 px-6 sm:px-12">
        <div className="flex justify-between items-center max-w-7xl mx-auto h-16">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="text-xl font-extrabold text-primary tracking-tight">KanoonScan</span>
            <span className="hidden sm:inline bg-primary-container/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest border border-primary/30 uppercase">
              Intelligence
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" href="/#how-it-works">
              How It Works
            </a>
            <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" href="/#features">
              Features
            </a>
            <Link className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" href="/dashboard">
              Dashboard
            </Link>
            <Link className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" href="/vault">
              Document Vault
            </Link>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-8 rounded-full border border-primary/20",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in">
                <button className="px-5 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-all">
                  Login
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="px-5 py-2 text-sm font-bold bg-primary text-[#002a78] hover:shadow-[0_0_20px_rgba(180,197,255,0.4)] rounded-lg transition-all">
                  Get Started Free
                </button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-24 overflow-hidden flex flex-col items-center justify-center">
        <ShaderBackground />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary-container/10 border border-primary/20 px-3 py-1 rounded-full text-primary font-data-label text-xs animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              AI-POWERED LEGAL DOCUMENT INTELLIGENCE
            </div>
            <h1 className="font-headline-xl text-4xl sm:text-5xl lg:text-6xl text-on-background tracking-tight font-extrabold animate-fade-in-up leading-tight">
              Scan. Analyze. <span className="text-primary">Understand.</span>
            </h1>
            <p className="text-on-surface-variant font-body-lg text-lg sm:text-xl max-w-lg mx-auto lg:mx-0 animate-fade-in-up">
              AI-powered legal document analysis in seconds. Extract critical clauses, identify risks, and synthesize summaries with Bloomberg-level precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start animate-fade-in-up">
              <Link href="/dashboard">
                <button className="w-full sm:w-auto bg-primary-container text-white px-8 py-4 rounded-lg font-semibold hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all flex items-center justify-center gap-2">
                  Start Scanning Free
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </Link>
              <a href="/#how-it-works" className="w-full sm:w-auto">
                <button className="w-full border border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">play_circle</span>
                  See How It Works
                </button>
              </a>
            </div>
          </div>

          {/* 3D Visual Mesh container */}
          <div className="relative h-[350px] sm:h-[450px] lg:h-[550px] flex items-center justify-center animate-fade-in-up">
            <Doc3DAnimation className="w-full h-full" />
            {/* Glowing orbs background */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-tertiary/5 blur-[120px] rounded-full pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Trust compliance strip */}
      <section className="py-12 bg-surface-container-lowest border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-80">
          <div className="flex items-center gap-3 bg-surface-container/30 backdrop-blur-sm p-4 rounded-xl border border-outline-variant/25">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            <span className="font-semibold text-on-surface text-sm">256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-3 bg-surface-container/30 backdrop-blur-sm p-4 rounded-xl border border-outline-variant/25">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            <span className="font-semibold text-on-surface text-sm">GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-3 bg-surface-container/30 backdrop-blur-sm p-4 rounded-xl border border-outline-variant/25">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
            <span className="font-semibold text-on-surface text-sm">SOC 2 Type II Certified</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Precision-Engineered Features</h2>
          <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl mx-auto">Our AI engine is purpose-built for the complexities of legal language, providing multi-layered analysis at light speed.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group bg-surface-container p-8 rounded-xl border border-outline-variant/30 hover:border-primary transition-all duration-300 legal-card-border-verified hover:shadow-[0_0_35px_rgba(37,99,235,0.2)]">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">document_scanner</span>
            </div>
            <h3 className="text-lg font-bold mb-3 text-on-surface">Smart Scanning</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Advanced OCR and layout recognition that processes messy PDFs and scanned contracts into structured text with 99.9% accuracy.</p>
          </div>
          {/* Card 2 */}
          <div className="group bg-surface-container p-8 rounded-xl border border-outline-variant/30 hover:border-primary transition-all duration-300 legal-card-border-verified hover:shadow-[0_0_35px_rgba(37,99,235,0.2)]">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">search_insights</span>
            </div>
            <h3 className="text-lg font-bold mb-3 text-on-surface">AI Clause Detection</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Identify and categorize hundreds of clause types instantly—from indemnification to non-competes—using neural semantic mapping.</p>
          </div>
          {/* Card 3 */}
          <div className="group bg-surface-container p-8 rounded-xl border border-outline-variant/30 hover:border-primary transition-all duration-300 legal-card-border-risk hover:shadow-[0_0_35px_rgba(37,99,235,0.2)]">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="text-lg font-bold mb-3 text-on-surface">Risk Mitigation</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Flag high-risk terms, hidden traps, and atypical deviations from standard legal structures before signing.</p>
          </div>
          {/* Card 4 */}
          <div className="group bg-surface-container p-8 rounded-xl border border-outline-variant/30 hover:border-primary transition-all duration-300 legal-card-border-verified hover:shadow-[0_0_35px_rgba(37,99,235,0.2)]">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">database</span>
            </div>
            <h3 className="text-lg font-bold mb-3 text-on-surface">Metadata Extraction</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Automatically extract dates, party names, financial commitments, and key deliverables into structured summaries.</p>
          </div>
          {/* Card 5 */}
          <div className="group bg-surface-container p-8 rounded-xl border border-outline-variant/30 hover:border-primary transition-all duration-300 legal-card-border-verified hover:shadow-[0_0_35px_rgba(37,99,235,0.2)]">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">encrypted</span>
            </div>
            <h3 className="text-lg font-bold mb-3 text-on-surface">Secure Vault</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Institutional-grade document repository with AES-256 zero-knowledge encryption for complete privacy assurance.</p>
          </div>
          {/* Card 6 */}
          <div className="group bg-surface-container p-8 rounded-xl border border-outline-variant/30 hover:border-primary transition-all duration-300 legal-card-border-caution hover:shadow-[0_0_35px_rgba(37,99,235,0.2)]">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">summarize</span>
            </div>
            <h3 className="text-lg font-bold mb-3 text-on-surface">Plain-English Translations</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Instantly translate complex legalese jargon into clean, plain English summaries to save hours of reviewing.</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-surface-container-low relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">From Upload to Intelligence</h2>
              <p className="text-on-surface-variant text-base sm:text-lg">Our streamlined workflow is designed for the modern legal desk, requiring zero configuration to get started.</p>
            </div>
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined">timer</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest">AVERAGE SPEED</p>
                <p className="text-lg font-bold text-on-surface">14 Seconds / 50 Pages</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-[2px] bg-gradient-to-r from-primary/10 via-primary to-primary/10 -z-0"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-surface-container border-4 border-[#0b1326] rounded-full flex items-center justify-center mb-6 shadow-xl text-primary">
                <span className="material-symbols-outlined text-4xl">cloud_upload</span>
              </div>
              <div className="text-xs font-semibold text-primary mb-2">STEP 01</div>
              <h3 className="text-lg font-bold mb-3">Upload</h3>
              <p className="text-on-surface-variant text-sm">Drag and drop any legal document. We support PDF, DOC, DOCX, and scanned image formats.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-surface-container border-4 border-[#0b1326] rounded-full flex items-center justify-center mb-6 shadow-xl text-primary">
                <span className="material-symbols-outlined text-4xl">psychology</span>
              </div>
              <div className="text-xs font-semibold text-primary mb-2">STEP 02</div>
              <h3 className="text-lg font-bold mb-3">Analyze</h3>
              <p className="text-on-surface-variant text-sm">Our Large Legal Model (LLM) scans the text against institutional playbooks in real-time.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-surface-container border-4 border-[#0b1326] rounded-full flex items-center justify-center mb-6 shadow-xl text-primary">
                <span className="material-symbols-outlined text-4xl">assignment_turned_in</span>
              </div>
              <div className="text-xs font-semibold text-primary mb-2">STEP 03</div>
              <h3 className="text-lg font-bold mb-3">Report</h3>
              <p className="text-on-surface-variant text-sm">Receive a comprehensive risk report, interactive clause explorer, and summary.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="bg-primary-container/10 border border-primary/20 rounded-[2rem] p-12 lg:p-24 overflow-hidden relative">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/25 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to automate your legal review?</h2>
            <p className="text-on-surface-variant text-base sm:text-lg">Join 1,200+ law firms already using KanoonScan to reduce review time by 85%.</p>
            <div className="pt-6">
              <Link href="/dashboard">
                <button className="bg-primary-container text-white px-10 py-5 rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all transform hover:-translate-y-1">
                  Get Started Now — It's Free
                </button>
              </Link>
              <p className="mt-4 text-xs text-outline uppercase tracking-wider">NO CREDIT CARD REQUIRED. START IN SECONDS.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-outline-variant bg-surface-container-lowest">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 max-w-7xl mx-auto">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <div className="text-lg font-bold text-on-surface">KanoonScan</div>
            </div>
            <p className="text-on-surface-variant text-sm">
              Institutional-grade legal intelligence platform powered by advanced proprietary AI models.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-on-surface font-bold text-sm">Platform</h4>
            <nav className="flex flex-col gap-2">
              <Link className="text-on-surface-variant hover:text-primary transition-opacity text-sm" href="/dashboard">Dashboard</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-opacity text-sm" href="/vault">Vault</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-opacity text-sm" href="/scan">Scan Document</Link>
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="text-on-surface font-bold text-sm">Legal & Security</h4>
            <nav className="flex flex-col gap-2">
              <a className="text-on-surface-variant hover:text-primary transition-opacity text-sm" href="#">Privacy Policy</a>
              <a className="text-on-surface-variant hover:text-primary transition-opacity text-sm" href="#">Terms of Service</a>
              <a className="text-on-surface-variant hover:text-primary transition-opacity text-sm" href="#">Security Architecture</a>
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="text-on-surface font-bold text-sm">Contact</h4>
            <nav className="flex flex-col gap-2">
              <a className="text-on-surface-variant hover:text-primary transition-opacity text-sm" href="#">Support Center</a>
              <a className="text-on-surface-variant hover:text-primary transition-opacity text-sm" href="#">Enterprise Sales</a>
              <a className="text-on-surface-variant hover:text-primary transition-opacity text-sm" href="#">API Docs</a>
            </nav>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-on-surface-variant text-xs">© 2026 KanoonScan. All rights reserved. Institutional Grade Security.</p>
          <div className="flex gap-6">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer text-xl">public</span>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer text-xl">chat</span>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer text-xl">mail</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
