"use client";

export default function About() {
  return (
    <section className="py-24 bg-background-dark">
      <div className="max-w-4xl mx-auto px-6">
        <div className="p-12 rounded-xl bg-slate-900 border border-primary/20 text-center space-y-8">
          <h2 className="text-3xl font-black text-white">
            The Tech Behind KanoonScan
          </h2>

          <p className="text-slate-400 leading-relaxed">
            KanoonScan was built to democratize legal literacy. By leveraging
            the power of Google's Gemini AI, we provide high-level legal
            analysis that was previously only accessible through expensive
            attorneys.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-white/5">
              Next.js 14
            </span>
            <span className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-white/5">
              Gemini Pro API
            </span>
            <span className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-white/5">
              Tailwind CSS
            </span>
            <span className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-white/5">
              Pinecone Vector DB
            </span>
            <span className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-white/5">
              Supabase
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
