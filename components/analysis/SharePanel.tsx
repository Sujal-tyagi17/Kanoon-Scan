"use client";

import { useEffect, useRef, useState } from "react";

interface SharePanelProps {
  analysisId: string;
  initialEnabled: boolean;
  initialToken: string | null;
}

/** Share button + popover to turn a public, read-only report link on or off. */
export default function SharePanel({ analysisId, initialEnabled, initialToken }: SharePanelProps) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [path, setPath] = useState(initialToken ? `/share/${initialToken}` : null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const url = path && typeof window !== "undefined" ? `${window.location.origin}${path}` : "";

  const toggle = async (next: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, enabled: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't update sharing");
      setEnabled(data.shareEnabled);
      setPath(data.sharePath);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy — select the link and copy it manually.");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`flex items-center justify-center gap-1.5 rounded-lg h-9 px-3 border transition-colors focus-ring ${
          enabled
            ? "bg-primary/15 border-primary/40 text-primary"
            : "bg-surface-container border-outline-variant text-on-surface-variant hover:text-primary"
        }`}
        title="Share report"
      >
        <span className="material-symbols-outlined text-lg">{enabled ? "public" : "share"}</span>
        <span className="hidden md:inline text-sm font-semibold">Share</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Share report"
          className="absolute right-0 top-11 z-50 w-[min(92vw,360px)] bg-surface-container border border-outline-variant rounded-xl shadow-2xl p-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-on-surface">Public link</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Anyone with the link can view a read-only copy of this report. The full document text is never shown.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={enabled}
              aria-label="Enable public link"
              disabled={busy}
              onClick={() => toggle(!enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors disabled:opacity-50 focus-ring ${
                enabled ? "bg-primary" : "bg-surface-variant"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {enabled && url && (
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
                className="field !py-2 !text-xs font-data-mono"
                aria-label="Share link"
              />
              <button onClick={copy} className="btn-primary !px-3 !py-2 shrink-0">
                <span className="material-symbols-outlined text-[18px]">{copied ? "check" : "content_copy"}</span>
                <span className="sr-only">{copied ? "Copied" : "Copy link"}</span>
              </button>
            </div>
          )}

          {enabled && (
            <p className="text-[11px] text-outline">Turn the switch off at any time to disable the link.</p>
          )}
          {error && <p role="alert" className="text-xs text-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
