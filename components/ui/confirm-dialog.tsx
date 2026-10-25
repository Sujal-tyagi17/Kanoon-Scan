"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  loading,
  confirmDisabled,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !loading && onCancel()} />
      <div className="relative w-full max-w-md bg-surface-container border border-outline-variant rounded-xl shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <div className={`size-10 shrink-0 rounded-full flex items-center justify-center ${destructive ? "bg-error/15 text-error" : "bg-primary/15 text-primary"}`}>
            <span className="material-symbols-outlined">{destructive ? "warning" : "help"}</span>
          </div>
          <div>
            <h2 id="confirm-title" className="text-lg font-bold text-on-surface">{title}</h2>
            <div className="text-sm text-on-surface-variant mt-1.5">{description}</div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button ref={cancelRef} onClick={onCancel} disabled={loading} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
            className={destructive
              ? "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-error text-on-error font-bold text-sm hover:opacity-90 disabled:opacity-50 focus-ring"
              : "btn-primary"}
          >
            {loading && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
