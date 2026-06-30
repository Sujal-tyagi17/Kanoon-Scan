"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-40 pb-20 overflow-hidden hero-gradient">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-sm">
              auto_awesome
            </span>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Powered by Gemini AI
            </span>
          </div>

          <h1 className="text-6xl md:text-[75px] font-black leading-[1.05] tracking-tight text-white">
            Your Contract Has{" "}
            <span className="text-primary italic">Traps</span>. We Find Them.
          </h1>

          <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
            Instantly identify high-risk clauses, missing protections, and
            unfavorable terms in any legal document using advanced neural
            analysis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/sign-up">
              <button className="px-10 py-5 rounded-full bg-primary text-[#231c0f] text-lg font-black hover:scale-105 transition-transform shadow-xl shadow-primary/20">
                Scan My Contract Free
              </button>
            </Link>
          </div>
        </div>

        {/* Right - Contract Preview */}
        <div className="relative group">
          <div className="relative z-10 bg-slate-900/50 p-4 rounded-xl border border-white/10 backdrop-blur-sm rotate-3 transform transition-transform group-hover:rotate-0 duration-700">
            <div className="bg-white rounded-lg p-8 shadow-2xl space-y-4 text-slate-800 h-[500px] overflow-hidden relative">
              {/* Document Header */}
              <div className="h-4 w-1/3 bg-slate-200 rounded"></div>

              {/* Content Lines */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 rounded"></div>
                <div className="h-3 w-5/6 bg-slate-100 rounded"></div>

                {/* Warning Clause */}
                <div className="h-auto w-full bg-primary/20 rounded border-l-4 border-primary p-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary uppercase">
                    Revision Needed: Salary Escalation
                  </span>
                </div>

                <div className="h-3 w-4/6 bg-slate-100 rounded"></div>
              </div>

              {/* Critical Clause */}
              <div className="space-y-2">
                <div className="h-auto w-full bg-red-100 rounded border-l-4 border-red-500 p-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-red-600 uppercase">
                    Danger: Aggressive Non-Compete Clause
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded"></div>
                <div className="h-3 w-3/4 bg-slate-100 rounded"></div>
              </div>

              {/* Safe Clause */}
              <div className="space-y-2">
                <div className="h-auto w-full bg-green-100 rounded border-l-4 border-green-500 p-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-green-600 uppercase">
                    Safe: Termination Rights
                  </span>
                </div>
                <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
              </div>

              {/* Risk Badge */}
              <div className="absolute top-10 right-10 bg-red-600 text-white p-4 rounded-xl shadow-2xl flex flex-col items-center justify-center border-4 border-white transform -rotate-12">
                <span className="text-2xl font-black leading-none">78/100</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  High Risk
                </span>
              </div>
            </div>
          </div>

          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full -z-10"></div>
        </div>
      </div>
    </section>
  );
}
