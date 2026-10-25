import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AppShell from "@/components/dashboard/AppShell";
import StatsCards from "@/components/dashboard/StatsCards";
import DocumentList from "@/components/dashboard/DocumentList";
import RiskSummaryChart from "@/components/dashboard/RiskSummaryChart";
import { getOrCreateDbUser } from "@/lib/auth";
import { listUserDocuments } from "@/lib/documents";
import { getUsage } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dbUser = await getOrCreateDbUser();
  if (!dbUser) redirect("/sign-in");

  const [clerkUser, allDocs, usage] = await Promise.all([
    currentUser(),
    listUserDocuments(dbUser._id.toString()),
    getUsage(dbUser._id.toString(), "analysis").catch(() => null),
  ]);

  const completed = allDocs.filter((d) => d.status === "Completed");
  const scored = completed.filter((d) => typeof d.riskScore === "number");
  const avgScore = scored.length
    ? Math.round(scored.reduce((s, d) => s + (d.riskScore || 0), 0) / scored.length)
    : null;
  const highRisk = completed.filter((d) => d.riskLevel === "HIGH" || d.riskLevel === "CRITICAL").length;

  const firstName = clerkUser?.firstName || clerkUser?.username || "there";

  const stats = [
    {
      label: "Docs scanned",
      icon: "description",
      value: allDocs.length,
      hint: usage ? `${usage.used} / ${usage.limit} analyses used today` : undefined,
    },
    { label: "Analysed", icon: "check_circle", value: completed.length },
    {
      label: "Avg risk score",
      icon: "speed",
      value: avgScore === null ? "—" : avgScore,
      hint: avgScore === null ? "No reports yet" : "out of 100",
    },
    { label: "High / critical", icon: "gpp_maybe", value: highRisk, hint: highRisk ? "Review before signing" : undefined },
  ];

  return (
    <AppShell title="Dashboard">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-background">
              Welcome back, {firstName}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              {allDocs.length
                ? "Here's an overview of the contracts you've analysed."
                : "Upload your first contract to see its risks in plain English."}
            </p>
          </div>
          {allDocs.length === 0 && (
            <Link href="/scan" className="btn-primary self-start">
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Scan your first document
            </Link>
          )}
        </div>

        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <DocumentList
              documents={allDocs.slice(0, 5)}
              title="Recent documents"
              subtitle="Your latest scans"
              showViewAll
            />
          </div>
          <RiskSummaryChart documents={completed.map((d) => ({ riskLevel: d.riskLevel || "MEDIUM" }))} />
        </div>
      </div>
    </AppShell>
  );
}
