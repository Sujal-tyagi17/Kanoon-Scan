export default function Loading() {
  return (
    <div className="h-screen flex items-center justify-center bg-background" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-on-surface-variant">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}
