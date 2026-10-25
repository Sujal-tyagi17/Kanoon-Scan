interface StatCardProps {
  label: string;
  icon: string;
  value: string | number;
  hint?: string;
}

const StatCard = ({ label, icon, value, hint }: StatCardProps) => (
  <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant hover:border-primary/40 transition-colors">
    <div className="flex items-center justify-between mb-3">
      <span className="text-on-surface-variant font-data-label text-[11px] uppercase tracking-widest">{label}</span>
      <span className="material-symbols-outlined text-primary/80 text-[20px]">{icon}</span>
    </div>
    <p className="text-3xl font-semibold tracking-tight text-on-surface">{value}</p>
    {hint && <p className="text-xs text-outline mt-1">{hint}</p>}
  </div>
);

export default function StatsCards({ stats }: { stats: StatCardProps[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
