import Link from "next/link";

export default function ShareNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md text-center space-y-4">
        <span className="material-symbols-outlined text-primary text-5xl">link_off</span>
        <h1 className="font-display text-2xl font-bold text-on-surface">This link isn&apos;t available</h1>
        <p className="text-sm text-on-surface-variant">
          The report may have been unshared or deleted by its owner.
        </p>
        <Link href="/" className="btn-primary">Go to KanoonScan</Link>
      </div>
    </div>
  );
}
