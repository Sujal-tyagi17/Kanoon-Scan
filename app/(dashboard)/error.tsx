"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-surface-container border border-outline-variant rounded-xl p-6 text-center space-y-4">
        <div className="size-12 mx-auto rounded-full bg-error/15 text-error flex items-center justify-center">
          <span className="material-symbols-outlined">error</span>
        </div>
        <h1 className="text-xl font-bold text-on-surface">Something went wrong</h1>
        <p className="text-sm text-on-surface-variant">
          We couldn&apos;t load this page. This is usually a server configuration or database issue.
        </p>
        {error.digest && (
          <p className="text-xs text-outline font-data-mono break-all">Error ID: {error.digest}</p>
        )}
        <div className="flex justify-center gap-3">
          <button onClick={reset} className="btn-primary">Try again</button>
          <Link href="/" className="btn-secondary">Home</Link>
        </div>
      </div>
    </div>
  );
}
