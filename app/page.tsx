"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Logo from "@/components/Logo";
import ShaderBackground from "@/components/ShaderBackground";
import Doc3DAnimation from "@/components/Doc3DAnimation";

const FEATURES = [
  {
    icon: "gpp_maybe",
    title: "Risk detection",
    body: "Every clause is rated low to critical, with a 0–100 score for the whole document so you know where to look first.",
  },
  {
    icon: "translate",
    title: "Plain-English summaries",
    body: "Dense legalese rewritten into short, readable explanations — what the clause says and what it means for you.",
  },
  {
    icon: "balance",
    title: "Who benefits, who's at risk",
    body: "See which party each clause favours, why it might be risky, and a suggested fix you can take to the other side.",
  },
  {
    icon: "database",
    title: "Key details extracted",
    body: "Parties, dates, payment terms, notice periods and governing law pulled out into one structured summary.",
  },
  {
    icon: "forum",
    title: "Ask questions",
    body: "Chat with your document: “Can I terminate early?” “What happens if I pay late?” — answered from the contract text.",
  },
  {
    icon: "picture_as_pdf",
    title: "Exportable reports",
    body: "Download a clean, print-friendly report to share with a colleague or your lawyer.",
  },
];

const STEPS = [
  { icon: "upload_file", title: "Upload", body: "Drop in a PDF, DOCX or TXT file — or paste the text directly." },
  { icon: "psychology", title: "Analyse", body: "The AI reads every clause, flags risks and extracts the key terms." },
  { icon: "verified", title: "Decide", body: "Review the risk score, summary and suggested changes before you sign." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/30 px-4 sm:px-12">
        <div className="flex justify-between items-center max-w-7xl mx-auto h-16 w-full">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="w-9 h-9" />
            <span className="text-xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              KanoonScan
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm" href="#how-it-works">
              How it works
            </a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm" href="#features">
              Features
            </a>
          </div>

          <div className="flex items-center gap-3">
            <SignedIn>
              <Link href="/dashboard" className="btn-primary !py-2">
                Dashboard
              </Link>
              <UserButton appearance={{ elements: { avatarBox: "size-8 rounded-full border border-primary/20" } }} />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="text-sm font-semibold text-on-surface-variant hover:text-primary px-3 py-2 rounded-lg focus-ring">
                Log in
              </Link>
              <Link href="/sign-up" className="btn-primary !py-2">
                Get started
              </Link>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[100svh] pt-24 pb-12 overflow-hidden flex flex-col items-center justify-center">
        <ShaderBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center w-full">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-1.5 border border-primary/30 rounded-full bg-surface-container-lowest/80">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
              <span className="font-data-mono text-primary uppercase tracking-[0.2em] text-xs">AI contract analysis</span>
            </div>
            <h1 className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl leading-[1.05] text-on-surface">
              Know before <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">you sign.</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-lg mx-auto lg:mx-0">
              Upload a rental agreement, offer letter or NDA. KanoonScan flags risky clauses, explains them in plain
              English and tells you what to ask for — in about a minute.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
              <SignedOut>
                <Link href="/sign-up" className="btn-primary !px-8 !py-3.5 text-base">
                  Analyse a document free
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>
                <a href="#how-it-works" className="btn-secondary !px-8 !py-3.5 text-base">
                  See how it works
                </a>
              </SignedOut>
              <SignedIn>
                <Link href="/scan" className="btn-primary !px-8 !py-3.5 text-base">
                  Scan a document
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>
                <Link href="/dashboard" className="btn-secondary !px-8 !py-3.5 text-base">
                  Go to dashboard
                </Link>
              </SignedIn>
            </div>
          </div>

          <div className="relative h-[300px] sm:h-[420px] lg:h-[540px] flex items-center justify-center">
            <Doc3DAnimation className="w-full h-full" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-8 bg-surface-container-lowest border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-4 sm:gap-8">
          {[
            { icon: "encrypted", text: "Document text encrypted at rest (AES-256)" },
            { icon: "delete_forever", text: "Delete your data any time" },
            { icon: "description", text: "PDF, DOCX & TXT supported" },
          ].map((t) => (
            <div key={t.icon} className="flex items-center gap-3 px-4 py-2">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {t.icon}
              </span>
              <span className="font-medium text-on-surface text-sm">{t.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 space-y-3">
            <h2 className="font-display text-4xl sm:text-5xl font-bold">How it works</h2>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 relative">
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px step-connector opacity-30" />
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center bg-background mb-4 text-primary relative">
                  <span className="material-symbols-outlined">{step.icon}</span>
                  <span className="absolute -top-2 -right-2 size-6 rounded-full bg-primary text-[#452b00] text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-on-surface-variant max-w-xs">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-16">
        <div className="text-center mb-14 space-y-3">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary">What you get</h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="hairline-gold glass-vault p-7 rounded-xl group hover:border-primary/60 transition-colors duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5 text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">{f.icon}</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-on-surface mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product preview */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4 space-y-5">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-on-surface">One report, everything that matters</h2>
            <p className="text-on-surface-variant">
              The document on one side, the risks on the other. Save the clauses you care about, ask follow-up
              questions, and export when you&apos;re done.
            </p>
            <ul className="space-y-3">
              {["Risk score & category breakdown", "Clause-by-clause explanations", "Saved clauses & document vault"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <span className="text-sm text-on-surface">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-8">
            <div className="hairline-gold rounded-xl overflow-hidden shadow-2xl bg-surface-container-lowest">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/30">
                <span className="w-3 h-3 rounded-full bg-red-500/50" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <span className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <Image
                src="/screenshots/analysis.png"
                alt="KanoonScan analysis report showing a contract, its risk score and flagged clauses"
                width={1892}
                height={861}
                className="w-full h-auto"
                sizes="(min-width: 1024px) 66vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10 blur-[120px]" />
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-5">
            Read the fine print <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">without the headache.</span>
          </h2>
          <p className="text-lg text-on-surface-variant mb-8">Free to use. Your first report takes about a minute.</p>
          <SignedOut>
            <Link href="/sign-up" className="btn-primary !px-8 !py-3.5 text-base">Start your free analysis</Link>
          </SignedOut>
          <SignedIn>
            <Link href="/scan" className="btn-primary !px-8 !py-3.5 text-base">Scan a document</Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-3 max-w-sm">
            <div className="flex items-center gap-2">
              <Logo className="w-9 h-9" />
              <span className="font-display text-2xl font-bold text-primary">KanoonScan</span>
            </div>
            <p className="text-sm text-on-surface-variant">
              AI-powered contract analysis. KanoonScan is an informational tool and does not provide legal advice.
            </p>
          </div>
          <nav className="flex gap-10 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-label-caps text-primary text-xs uppercase tracking-widest mb-1">Product</span>
              <a className="text-on-surface-variant hover:text-primary" href="#features">Features</a>
              <a className="text-on-surface-variant hover:text-primary" href="#how-it-works">How it works</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-label-caps text-primary text-xs uppercase tracking-widest mb-1">Account</span>
              <Link className="text-on-surface-variant hover:text-primary" href="/sign-in">Log in</Link>
              <Link className="text-on-surface-variant hover:text-primary" href="/sign-up">Sign up</Link>
            </div>
          </nav>
        </div>
        <div className="border-t border-outline-variant/20 py-5 text-center text-xs text-outline">
          © {new Date().getFullYear()} KanoonScan · Built by Sujal Tyagi
        </div>
      </footer>
    </div>
  );
}
