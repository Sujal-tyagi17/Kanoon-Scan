"use client";

export default function Features() {
  const features = [
    {
      icon: "warning",
      title: "Dangerous Clauses",
      description:
        "Automatic detection of predatory non-competes, infinite indemnity, and hidden fees.",
    },
    {
      icon: "search_off",
      title: "Missing Protections",
      description:
        "Identifies critical safeguards that are missing from your document that you should negotiate for.",
    },
    {
      icon: "translate",
      title: "Legalese Translator",
      description:
        "Converts complex legal jargon into plain English so you actually know what you're agreeing to.",
    },
    {
      icon: "compare_arrows",
      title: "Market Benchmarking",
      description:
        "Compare your terms against industry standards to see if you're getting a fair deal.",
    },
    {
      icon: "shield_person",
      title: "Privacy First",
      description:
        "Enterprise-grade encryption ensures your documents are never stored or seen by humans.",
    },
    {
      icon: "history_edu",
      title: "Counter-Offers",
      description:
        "AI-suggested alternative wording for unfavorable clauses to send back for negotiation.",
    },
  ];

  return (
    <section className="py-24 bg-background-dark" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-xl bg-slate-900/50 border border-white/5 hover:border-primary/30 transition-all group"
            >
              <span className="material-symbols-outlined text-primary text-4xl mb-6 block group-hover:scale-110 transition-transform">
                {feature.icon}
              </span>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
