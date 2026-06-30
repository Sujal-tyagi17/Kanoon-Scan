"use client";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload",
      description:
        "Drag and drop your PDF or Docx contract into our secure encrypted vault.",
    },
    {
      number: "02",
      title: "Analyze",
      description:
        "Gemini AI scans thousands of data points to identify traps and missing clauses.",
    },
    {
      number: "03",
      title: "Decide",
      description:
        "Review our detailed risk report and negotiate with confidence and data.",
    },
  ];

  return (
    <section className="py-24 bg-background-dark relative" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-white mb-4">
            Three Steps to Safety
          </h2>
          <p className="text-slate-400">
            Our AI does the heavy lifting while you stay in control.
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-12">
          {/* Dotted Line Connector */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-primary/30 -z-0"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-full bg-background-dark border-4 border-primary flex items-center justify-center text-primary text-3xl font-black shadow-[0_0_30px_rgba(245,159,10,0.2)]">
                {step.number}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="text-slate-500 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
