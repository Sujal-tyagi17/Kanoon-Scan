"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 glass-nav bg-[#231c0f]/80">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">
            balance
          </span>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-white leading-none">
              KanoonScan
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
              Know Before You Sign
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a
            className="text-sm font-medium text-slate-300 hover:text-primary transition-colors"
            href="#how-it-works"
          >
            How It Works
          </a>
          <a
            className="text-sm font-medium text-slate-300 hover:text-primary transition-colors"
            href="#features"
          >
            Features
          </a>

          <div className="flex items-center gap-4 ml-4">
            <Link href="/sign-in">
              <button className="px-6 py-2 rounded-full border border-primary/30 text-sm font-bold text-slate-300 hover:bg-primary/10 transition-all">
                Login
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="px-6 py-2 rounded-full bg-primary text-[#231c0f] text-sm font-bold hover:shadow-[0_0_20px_rgba(245,159,10,0.4)] transition-all">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
