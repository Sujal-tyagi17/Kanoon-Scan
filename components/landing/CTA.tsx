"use client";

import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-32 bg-background-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10"></div>
      <div className="max-w-7xl mx-auto px-6 text-center space-y-10">
        <span className="material-symbols-outlined text-primary text-7xl inline-block">
          balance
        </span>

        <h2 className="text-5xl md:text-7xl font-black text-white max-w-4xl mx-auto leading-tight">
          Know Before You Sign.
        </h2>

        <Link href="/sign-up">
          <button className="px-12 py-6 rounded-full bg-primary text-[#231c0f] text-xl font-black hover:scale-110 transition-transform shadow-[0_0_40px_rgba(245,159,10,0.3)]">
            Scan Your First Document Free
          </button>
        </Link>
      </div>
    </section>
  );
}
