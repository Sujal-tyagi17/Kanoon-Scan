"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Logo from "@/components/Logo";
import ShaderBackground from "@/components/ShaderBackground";
import Doc3DAnimation from "@/components/Doc3DAnimation";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary/30 selection:text-on-primary">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/30 px-6 sm:px-12">
        <div className="flex justify-between items-center max-w-7xl mx-auto h-16 w-full">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="text-xl font-display-lg text-headline-md bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">KanoonScan</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-12">
            <a className="text-on-surface-variant font-medium font-label-caps tracking-widest hover:text-primary transition-colors text-sm" href="/#how-it-works">
              How It Works
            </a>
            <a className="text-on-surface-variant font-medium font-label-caps tracking-widest hover:text-primary transition-colors text-sm" href="/#features">
              Features
            </a>
            <SignedIn>
              <Link className="text-on-surface-variant font-medium font-label-caps tracking-widest hover:text-primary transition-colors text-sm" href="/dashboard">
                Dashboard
              </Link>
              <Link className="text-on-surface-variant font-medium font-label-caps tracking-widest hover:text-primary transition-colors text-sm" href="/vault">
                Document Vault
              </Link>
            </SignedIn>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-6">
            <SignedIn>
              <Link className="text-on-surface-variant font-medium font-label-caps tracking-widest hover:text-primary transition-colors text-sm mr-2" href="/dashboard">
                Dashboard
              </Link>
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
                <button className="bg-gradient-to-r from-primary-container to-primary px-6 py-2 text-sm font-label-caps text-[#452b00] font-bold rounded-DEFAULT hover:opacity-90 active:scale-95 transition-all">
                  Login
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
            <div className="inline-flex items-center px-4 py-1.5 border border-primary/30 rounded-full mb-md max-w-fit bg-surface-container-lowest">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
              <span className="font-data-mono text-label-caps text-primary uppercase tracking-[0.2em] text-xs">Legal AI</span>
            </div>
            <h1 className="font-display-lg text-[72px] leading-[1.1] mb-md text-on-surface">
              Scan. Analyze. <br/>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Understand.</span>
            </h1>
            <p className="font-body-lg text-on-surface-variant mb-xl max-w-lg mx-auto lg:mx-0">
              AI-powered legal document analysis in seconds. Uncover hidden risks, extract key clauses, and master your case files with the prestige of a digital elite counsel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <Link href="/sign-up">
                <button className="bg-gradient-to-r from-primary-container to-primary px-8 py-3.5 text-sm font-label-caps text-[#452b00] font-bold rounded-DEFAULT hover:opacity-90 active:scale-95 transition-all shadow-xl">
                  Analyze Now
                </button>
              </Link>
            </div>
          </div>

          {/* 3D Visual Mesh container */}
          <div className="relative h-[350px] sm:h-[450px] lg:h-[550px] flex items-center justify-center">
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
          <h2 className="font-headline-lg text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-sm">Unrivaled Legal Precision</h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="hairline-gold p-xl glass-vault group hover:border-primary/60 transition-all duration-500 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">document_scanner</span>
            </div>
            <h3 className="font-headline-md text-on-surface mb-sm">Document Vault</h3>
            <p className="font-body-md text-on-surface-variant">Securely store and organize thousands of case files with military-grade encryption and instant retrieval.</p>
          </div>
          {/* Card 2 */}
          <div className="hairline-gold p-xl glass-vault group hover:border-primary/60 transition-all duration-500 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">psychology</span>
            </div>
            <h3 className="font-headline-md text-on-surface mb-sm">AI Analysis</h3>
            <p className="font-body-md text-on-surface-variant">Our proprietary LLM cross-references jurisdictional precedents and highlights critical contractual obligations in milliseconds.</p>
          </div>
          {/* Card 3 */}
          <div className="hairline-gold p-xl glass-vault group hover:border-primary/60 transition-all duration-500 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">gpp_maybe</span>
            </div>
            <h3 className="font-headline-md text-on-surface mb-sm">Risk Detection</h3>
            <p className="font-body-md text-on-surface-variant">Automatically identify non-compliant clauses and potential liability triggers before they become legal liabilities.</p>
          </div>
          {/* Card 4 */}
          <div className="hairline-gold p-xl glass-vault group hover:border-primary/60 transition-all duration-500 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">database</span>
            </div>
            <h3 className="font-headline-md text-on-surface mb-sm">Metadata Extraction</h3>
            <p className="font-body-md text-on-surface-variant">Automatically extract dates, party names, financial commitments, and key deliverables into structured summaries.</p>
          </div>
          {/* Card 5 */}
          <div className="hairline-gold p-xl glass-vault group hover:border-primary/60 transition-all duration-500 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">encrypted</span>
            </div>
            <h3 className="font-headline-md text-on-surface mb-sm">Secure Vault</h3>
            <p className="font-body-md text-on-surface-variant">Institutional-grade document repository with AES-256 zero-knowledge encryption for complete privacy assurance.</p>
          </div>
          {/* Card 6 */}
          <div className="hairline-gold p-xl glass-vault group hover:border-primary/60 transition-all duration-500 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">summarize</span>
            </div>
            <h3 className="font-headline-md text-on-surface mb-sm">Translations</h3>
            <p className="font-body-md text-on-surface-variant">Instantly translate complex legalese jargon into clean, plain English summaries to save hours of reviewing.</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="font-headline-lg text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-2">The Verdict Journey</h2>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-[2px] step-connector -z-10 opacity-20"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="font-display-lg text-[80px] text-primary/10 leading-none mb-[-20px]">01</div>
              <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center bg-background mb-md text-primary">
                <span className="material-symbols-outlined">upload_file</span>
              </div>
              <h4 className="font-headline-md text-on-surface mb-sm">Ingest</h4>
              <p className="font-body-sm text-on-surface-variant max-w-xs">Upload raw PDFs, scans, or images. Our OCR preserves legal formatting perfectly.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="font-display-lg text-[80px] text-primary/10 leading-none mb-[-20px]">02</div>
              <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center bg-background mb-md text-primary">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <h4 className="font-headline-md text-on-surface mb-sm">Deep Scan</h4>
              <p className="font-body-sm text-on-surface-variant max-w-xs">AI neurons parse every sentence against 50+ global legal databases.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="font-display-lg text-[80px] text-primary/10 leading-none mb-[-20px]">03</div>
              <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center bg-background mb-md text-primary">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <h4 className="font-headline-md text-on-surface mb-sm">Verdict</h4>
              <p className="font-body-sm text-on-surface-variant max-w-xs">Receive a comprehensive summary, risk score, and suggested amendments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="w-full bg-surface-container-high py-lg hairline-gold border-x-0">
        <div className="max-w-7xl mx-auto px-xl flex flex-wrap justify-between items-center gap-lg">
          <div className="flex flex-col">
            <span className="font-headline-md text-primary">10,000+</span>
            <span className="font-label-caps text-on-surface-variant">Files Processed</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-primary">99.2%</span>
            <span className="font-label-caps text-on-surface-variant">Accuracy Rate</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-primary">&lt; 30 sec</span>
            <span className="font-label-caps text-on-surface-variant">Avg Analysis Time</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-primary">50+</span>
            <span className="font-label-caps text-on-surface-variant">Jurisdictions</span>
          </div>
        </div>
      </section>

      {/* Vault Preview Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 space-y-6">
            <h2 className="font-headline-lg text-4xl sm:text-5xl font-bold text-on-surface">Master the Vault</h2>
            <p className="font-body-md text-on-surface-variant">
              A workspace designed for precision. Every file is a piece of intelligence, organized with the meticulous care of an archival specialist.
            </p>
            <ul className="space-y-md">
              <li className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-body-sm text-on-surface">Auto-tagging & Categorization</span>
              </li>
              <li className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-body-sm text-on-surface">Multi-party collaboration</span>
              </li>
              <li className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-body-sm text-on-surface">History Tracking & Diff Checks</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-8">
            <div className="hairline-gold rounded-xl overflow-hidden glass-vault shadow-2xl p-sm">
              {/* Dashboard UI Mockup */}
              <div className="bg-surface-container-lowest h-[450px] rounded-lg overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-md border-b border-outline-variant/20">
                  <div className="flex items-center gap-md">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="bg-surface-variant/30 px-md py-1 rounded text-label-caps text-xs opacity-60">vault.kanoonscan.com</div>
                  <div className="w-10"></div>
                </div>
                <div className="flex-1 flex">
                  <div className="w-48 border-r border-outline-variant/20 p-md flex flex-col gap-sm">
                    <div className="h-6 w-full bg-primary/10 rounded"></div>
                    <div className="h-6 w-3/4 bg-on-surface-variant/5 rounded"></div>
                    <div className="h-6 w-5/6 bg-on-surface-variant/5 rounded"></div>
                    <div className="mt-auto h-12 w-full border border-primary/20 rounded-md"></div>
                  </div>
                  <div className="flex-1 p-xl">
                    <div className="grid grid-cols-2 gap-lg h-full">
                      <div className="space-y-lg">
                        <div className="h-32 w-full bg-primary/5 border border-primary/10 rounded-xl p-md">
                          <div className="flex justify-between">
                            <div className="h-4 w-1/3 bg-primary/30 rounded"></div>
                            <div className="h-4 w-4 bg-primary/30 rounded-full"></div>
                          </div>
                          <div className="mt-md space-y-2">
                            <div className="h-2 w-full bg-on-surface/5 rounded"></div>
                            <div className="h-2 w-5/6 bg-on-surface/5 rounded"></div>
                            <div className="h-2 w-2/3 bg-on-surface/5 rounded"></div>
                          </div>
                        </div>
                        <div className="h-48 w-full bg-surface-container-high rounded-xl border border-outline-variant/20"></div>
                      </div>
                      <div className="bg-surface-container-highest/40 rounded-xl border border-primary/20 flex flex-col p-md">
                        <div className="h-4 w-1/2 bg-primary/40 rounded mb-md"></div>
                        <div className="flex-1 space-y-sm">
                          <div className="h-2 w-full bg-primary/10 rounded"></div>
                          <div className="h-2 w-full bg-primary/10 rounded"></div>
                          <div className="h-2 w-full bg-primary/10 rounded"></div>
                          <div className="h-2 w-2/3 bg-primary/10 rounded"></div>
                        </div>
                        <div className="h-10 w-full bg-primary rounded mt-md"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10 blur-[120px]"></div>
        <div className="max-w-container-max mx-auto px-xl text-center">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg mb-xl max-w-3xl mx-auto">
            Ready to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">master your legal documents?</span>
          </h2>
          <p className="font-body-lg text-on-surface-variant mb-xl max-w-xl mx-auto">
            Join the elite firms using KanoonScan to accelerate analysis and minimize risk.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center items-center">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <button className="bg-gradient-to-r from-primary-container to-primary px-8 py-3.5 text-sm font-label-caps text-[#452b00] font-bold rounded-DEFAULT hover:opacity-90 active:scale-95 transition-all shadow-xl">
                Start Your Free Analysis
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest pt-xl border-t border-primary/20">
        <div className="max-w-container-max mx-auto px-xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-xl pb-xl">
            <div className="space-y-md max-w-xs">
              <div className="flex items-center gap-sm">
                <Logo className="w-10 h-10" />
                <span className="font-display-lg text-headline-md text-primary">KanoonScan</span>
              </div>
              <p className="font-body-sm text-on-surface-variant">
                The ultimate confluence of legal authority and artificial intelligence. Built for those who settle for nothing less than the golden verdict.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-xl">
              <div className="space-y-sm">
                <span className="font-label-caps text-primary text-xs uppercase tracking-widest">Platform</span>
                <nav className="flex flex-col gap-2">
                  <a className="font-body-sm text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">Features</a>
                  <a className="font-body-sm text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">Security</a>
                  <a className="font-body-sm text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">Case Studies</a>
                </nav>
              </div>
              <div className="space-y-sm">
                <span className="font-label-caps text-primary text-xs uppercase tracking-widest">Company</span>
                <nav className="flex flex-col gap-2">
                  <a className="font-body-sm text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">About Us</a>
                  <a className="font-body-sm text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">Careers</a>
                  <a className="font-body-sm text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">Contact</a>
                </nav>
              </div>
              <div className="space-y-sm">
                <span className="font-label-caps text-primary text-xs uppercase tracking-widest">Legal</span>
                <nav className="flex flex-col gap-2">
                  <a className="font-body-sm text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">Privacy</a>
                  <a className="font-body-sm text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">Terms</a>
                  <a className="font-body-sm text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">GDPR</a>
                </nav>
              </div>
            </div>
          </div>
          <div className="py-lg border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-md">
            <p className="font-body-sm text-on-secondary-fixed-variant text-xs">© 2026 KanoonScan. All rights reserved.</p>
            <div className="flex gap-lg">
              <span className="font-data-mono text-[10px] text-on-surface-variant/40">LATENCY: 14MS</span>
              <span className="font-data-mono text-[10px] text-on-surface-variant/40">SYSTEM STATUS: NOMINAL</span>
              <span className="font-data-mono text-[10px] text-on-surface-variant/40">V.2.4.1</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
