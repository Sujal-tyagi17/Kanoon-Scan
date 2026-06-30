"use client";

export default function ProductPreview() {
  return (
    <section className="py-24 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-background-dark rounded-xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Terminal Header */}
          <div className="border-b border-white/10 p-4 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="px-4 py-1 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
              employment_contract_final_v2.pdf
            </div>
            <div className="w-10"></div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row h-[600px]">
            {/* Document Viewer */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-white/5">
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Critical Clause */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold border-b border-white/10 pb-2">
                    1. Non-Compete Restrictions
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed p-4 bg-red-500/10 border-l-4 border-red-500 rounded">
                    "The Employee shall not, for a period of{" "}
                    <span className="bg-red-500/30 text-white px-1 font-bold">
                      forty-eight (48) months
                    </span>{" "}
                    following the date of termination, engage in any business
                    activity that competes with the Company..."
                  </p>
                </div>

                {/* Warning Clause */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold border-b border-white/10 pb-2">
                    4. Compensation & Bonus
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded">
                    "Bonuses are discretionary and based on performance metrics{" "}
                    <span className="bg-yellow-500/30 text-white px-1 font-bold">
                      subject to change without prior notice
                    </span>{" "}
                    at the sole discretion of the Board..."
                  </p>
                </div>

                {/* Loading skeleton */}
                <div className="h-40 w-full bg-slate-800/20 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Sidebar - Risk Analysis */}
            <div className="w-full lg:w-80 border-l border-white/10 bg-slate-900/80 p-6 flex flex-col gap-8">
              {/* Risk Gauge */}
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center p-1 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 mb-4">
                  <div className="w-32 h-32 rounded-full bg-background-dark flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">78</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Risk Score
                    </span>
                  </div>
                </div>
                <h5 className="text-red-500 font-bold">High Risk Detected</h5>
              </div>

              {/* Risk Breakdown */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Restrictiveness</span>
                    <span className="text-red-500">92%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[92%] h-full bg-red-500"></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Clarity</span>
                    <span className="text-yellow-500">45%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[45%] h-full bg-yellow-500"></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Fairness</span>
                    <span className="text-orange-500">30%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[30%] h-full bg-orange-500"></div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full py-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-[#231c0f] transition-all">
                Generate Full Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
