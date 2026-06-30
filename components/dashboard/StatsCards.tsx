interface StatCardProps {
  label: string;
  icon: string;
  value: string | number;
  trend: {
    value: string;
    isPositive: boolean;
  };
}

const StatCard = ({ label, icon, value, trend }: StatCardProps) => (
  <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant hover:border-primary/50 transition-colors">
    <div className="flex items-center justify-between mb-4">
      <span className="text-on-surface-variant font-data-label text-xs uppercase tracking-widest">{label}</span>
      <span className="material-symbols-outlined text-primary">{icon}</span>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-3xl font-headline-lg text-on-surface mt-1">{value}</span>
      <span
        className={`text-xs font-bold flex items-center gap-0.5 ${
          trend.isPositive ? "text-tertiary" : "text-destructive"
        }`}
      >
        <span className="material-symbols-outlined text-xs">
          {trend.isPositive ? "trending_up" : "trending_down"}
        </span>{" "}
        {trend.value}
      </span>
    </div>
  </div>
);

interface StatsCardsProps {
  stats: StatCardProps[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
