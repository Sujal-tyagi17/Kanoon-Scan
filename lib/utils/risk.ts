export function calculateRiskLevel(score: number): string {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

export function getRiskColor(level: string): string {
  switch (level) {
    case "CRITICAL":
      return "text-red-600 bg-red-100";
    case "HIGH":
      return "text-orange-600 bg-orange-100";
    case "WARNING":
      return "text-amber-600 bg-amber-100";
    case "MEDIUM":
      return "text-yellow-600 bg-yellow-100";
    case "INFO":
      return "text-blue-600 bg-blue-100";
    case "MISSING":
      return "text-purple-600 bg-purple-100";
    case "SAFE":
      return "text-green-600 bg-green-100";
    case "LOW":
      return "text-green-600 bg-green-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function getClauseHighlightColor(level: string): string {
  switch (level) {
    case "CRITICAL":
      return "bg-red-200/60 border-l-4 border-red-600";
    case "WARNING":
      return "bg-amber-200/60 border-l-4 border-amber-600";
    case "INFO":
      return "bg-blue-200/40 border-l-4 border-blue-500";
    case "MISSING":
      return "bg-purple-200/40 border-l-4 border-purple-500 border-dashed";
    case "SAFE":
      return "bg-green-200/30 border-l-4 border-green-500";
    default:
      return "bg-gray-200/40 border-l-4 border-gray-400";
  }
}
