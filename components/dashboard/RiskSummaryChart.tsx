interface RiskMetricProps {
  documents: {
    riskLevel: "HIGH" | "MEDIUM" | "LOW";
  }[];
}

export default function RiskSummaryChart({ documents }: RiskMetricProps) {
  const total = documents.length;
  const highCount = documents.filter((d) => d.riskLevel === "HIGH").length;
  const medCount = documents.filter((d) => d.riskLevel === "MEDIUM").length;
  const lowCount = documents.filter((d) => d.riskLevel === "LOW").length;

  const getPercent = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const highPct = getPercent(highCount);
  const medPct = getPercent(medCount);
  const lowPct = getPercent(lowCount);

  return (
    <div className="bg-surface-container p-6 rounded-xl border border-outline-variant flex flex-col h-full justify-between">
      <div>
        <h3 className="text-lg font-bold text-on-surface">Risk Distribution</h3>
        <p className="text-on-surface-variant text-xs mt-0.5">Summary of analysis risk profiles</p>
      </div>

      {total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">pie_chart</span>
          <p className="text-sm">No data available</p>
        </div>
      ) : (
        <div className="space-y-6 my-auto pt-6">
          {/* Visual multi-segmented bar chart */}
          <div className="h-4 w-full bg-surface-container-low rounded-full overflow-hidden flex">
            {highPct > 0 && (
              <div 
                style={{ width: `${highPct}%` }} 
                className="h-full bg-[#ffb4ab] transition-all"
                title={`High Risk: ${highPct}%`}
              ></div>
            )}
            {medPct > 0 && (
              <div 
                style={{ width: `${medPct}%` }} 
                className="h-full bg-[#f5a623] transition-all"
                title={`Medium Risk: ${medPct}%`}
              ></div>
            )}
            {lowPct > 0 && (
              <div 
                style={{ width: `${lowPct}%` }} 
                className="h-full bg-[#d6b400] transition-all"
                title={`Low Risk: ${lowPct}%`}
              ></div>
            )}
          </div>

          {/* Metrics breakdown details list */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="size-2.5 rounded-full bg-[#ffb4ab]"></span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-data-label">High</span>
              </div>
              <p className="text-xl font-bold text-on-surface">{highPct}%</p>
              <p className="text-[10px] text-outline mt-0.5">{highCount} {highCount === 1 ? 'doc' : 'docs'}</p>
            </div>

            <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="size-2.5 rounded-full bg-[#f5a623]"></span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-data-label">Med</span>
              </div>
              <p className="text-xl font-bold text-on-surface">{medPct}%</p>
              <p className="text-[10px] text-outline mt-0.5">{medCount} {medCount === 1 ? 'doc' : 'docs'}</p>
            </div>

            <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="size-2.5 rounded-full bg-[#d6b400]"></span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-data-label">Low</span>
              </div>
              <p className="text-xl font-bold text-on-surface">{lowPct}%</p>
              <p className="text-[10px] text-outline mt-0.5">{lowCount} {lowCount === 1 ? 'doc' : 'docs'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
