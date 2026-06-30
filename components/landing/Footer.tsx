"use client";

export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 bg-background-dark">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <a
            className="text-slate-500 hover:text-white transition-colors text-sm"
            href="#"
          >
            Terms
          </a>
          <a
            className="text-slate-500 hover:text-white transition-colors text-sm"
            href="#"
          >
            Privacy
          </a>
          <a
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
            href="#"
          >
            <span className="material-symbols-outlined text-lg">code</span>
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
