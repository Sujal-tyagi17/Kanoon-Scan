import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import Logo from "@/components/Logo";
import { connectToDatabase } from "@/lib/db";
import { riskBadgeClass } from "@/lib/utils/documents-ui";
import { Analysis, Clause, Document, RiskCategory } from "@/types/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared contract report · KanoonScan",
  robots: { index: false, follow: false },
};

const ORDER: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

function scoreColor(score: number) {
  if (score > 75) return "#EF4444";
  if (score > 50) return "#F97316";
  if (score > 25) return "#FACC15";
  return "#22C55E";
}

async function loadShared(token: string) {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return null;
  const { db } = await connectToDatabase();
  const analysis = await db.collection<Analysis>("analyses").findOne({ shareToken: token, shareEnabled: true });
  if (!analysis) return null;
  const analysisId = analysis._id.toString();
  const [document, clauses, categories] = await Promise.all([
    ObjectId.isValid(String(analysis.documentId))
      ? db.collection<Document>("documents").findOne(
          { _id: new ObjectId(String(analysis.documentId)) },
          { projection: { name: 1, createdAt: 1 } } // never load the document text
        )
      : null,
    db.collection<Clause>("clauses").find({ analysisId }).toArray(),
    db.collection<RiskCategory>("riskCategories").find({ analysisId }).toArray(),
  ]);
  clauses.sort((a, b) => (ORDER[b.riskLevel] || 0) - (ORDER[a.riskLevel] || 0) || (a.position ?? 0) - (b.position ?? 0));
  return { analysis, document, clauses, categories };
}

export default async function SharedReportPage({ params }: { params: { token: string } }) {
  const data = await loadShared(params.token);
  if (!data) notFound();
  const { analysis, document, clauses, categories } = data;
  const score = Math.round(analysis.riskScore ?? 0);
  const verdict = analysis.overallVerdict;
  const keyInfo = Object.entries(analysis.keyInformation || {}).filter(
    ([, v]) => v && !/not specified/i.test(String(v))
  );

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="border-b border-outline-variant/40 bg-surface-container-lowest">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-display text-lg font-bold text-primary">KanoonScan</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant border border-outline-variant rounded-full px-3 py-1">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            Read-only shared report
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Title + score */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-outline font-data-label">Contract analysis</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1 break-words">{document?.name || "Shared document"}</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Analysed {new Date(analysis.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 bg-surface-container border border-outline-variant rounded-xl px-5 py-4">
            <div
              className="size-16 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ border: `4px solid ${scoreColor(score)}`, color: scoreColor(score) }}
            >
              {score}
            </div>
            <div>
              <p className="text-xs text-outline uppercase tracking-widest font-data-label">Risk score</p>
              <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${riskBadgeClass(analysis.riskLevel)}`}>
                {analysis.riskLevel}
              </span>
            </div>
          </div>
        </section>

        {verdict && (
          <section className="bg-surface-container border border-outline-variant rounded-xl p-5" style={{ borderLeft: `4px solid ${scoreColor(score)}` }}>
            <p className="font-bold text-on-surface">{verdict.status}</p>
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{verdict.explanation}</p>
          </section>
        )}

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-5">
            <h2 className="font-display text-xl font-bold mb-2">Summary</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">{analysis.summary}</p>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-xl p-5">
            <h2 className="font-display text-xl font-bold mb-2">In plain English</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{analysis.plainEnglish}</p>
          </div>
        </section>

        {categories.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-bold mb-3">Risk by category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((c) => (
                <div key={c._id.toString()} className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-on-surface">{c.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${riskBadgeClass(c.level)}`}>{c.level}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Clauses ({clauses.length})</h2>
          <div className="space-y-4">
            {clauses.map((c) => (
              <article key={c._id.toString()} className="bg-surface-container border border-outline-variant rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-on-surface">{c.title}</h3>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${riskBadgeClass(c.riskLevel)}`}>{c.riskLevel}</span>
                </div>
                <blockquote className="text-sm italic text-on-surface-variant border-l-2 border-primary/40 pl-3">
                  &ldquo;{c.originalText}&rdquo;
                </blockquote>
                <p className="text-sm text-on-surface">{c.explanation}</p>
                {c.riskLevel !== "LOW" && (
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-error/5 border border-error/20 rounded-lg p-3">
                      <p className="text-[11px] uppercase tracking-widest text-error font-data-label mb-1">Why it&apos;s risky</p>
                      <p className="text-on-surface-variant">{c.whyRisky}</p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-[11px] uppercase tracking-widest text-primary font-data-label mb-1">Ask for instead</p>
                      <p className="text-on-surface-variant">{c.suggestion}</p>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {keyInfo.length > 0 && (
          <section className="bg-surface-container border border-outline-variant rounded-xl p-5">
            <h2 className="font-display text-xl font-bold mb-3">Key details</h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {keyInfo.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] uppercase tracking-widest text-outline font-data-label">{k.replace(/([a-z])([A-Z])/g, "$1 $2")}</dt>
                  <dd className="text-sm text-on-surface">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <footer className="border-t border-outline-variant/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-outline">
          <p>AI-generated analysis for information only — not legal advice.</p>
          <Link href="/sign-up" className="btn-primary !py-2">Analyse your own contract</Link>
        </footer>
      </main>
    </div>
  );
}
