"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_BYTES = 16 * 1024 * 1024;
const ALLOWED = [".pdf", ".docx", ".txt"];

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (selected: File) => {
    const lower = selected.name.toLowerCase();
    if (!ALLOWED.some((ext) => lower.endsWith(ext))) {
      setError("Unsupported file type. Please upload a PDF, DOCX or TXT file.");
      return;
    }
    if (selected.size > MAX_BYTES) {
      setError("File is too large. Maximum size is 16MB.");
      return;
    }

    setFile(selected);
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selected);

    try {
      const response = await fetch("/api/process-document", { method: "POST", body: formData });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        router.push("/sign-in?redirect_url=/scan");
        return;
      }
      if (!response.ok) throw new Error(data.error || "Failed to process document");
      router.push(`/scan/analyzing?documentId=${data.documentId}`);
    } catch (err: any) {
      setError(err.message || "Failed to process document. Please try again.");
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!isUploading && e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const openPicker = () => !isUploading && fileInputRef.current?.click();

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a document"
        aria-busy={isUploading}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openPicker())}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={openPicker}
        className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 py-14 px-4 text-center transition-all duration-200 focus-ring ${
          isUploading ? "cursor-wait border-primary/40 bg-primary/5" : "cursor-pointer"
        } ${
          dragActive ? "border-primary bg-primary/10 scale-[0.99]" : "border-outline-variant hover:bg-surface-variant/20 hover:border-primary/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          disabled={isUploading}
        />

        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
          <span className={`material-symbols-outlined text-primary text-4xl ${isUploading ? "animate-spin" : ""}`}>
            {isUploading ? "progress_activity" : "cloud_upload"}
          </span>
        </div>

        {isUploading && file ? (
          <div className="space-y-1">
            <p className="text-on-surface text-lg font-bold">Reading {file.name}…</p>
            <p className="text-on-surface-variant text-sm">{formatSize(file.size)} · extracting text</p>
          </div>
        ) : (
          <div className="space-y-1 select-none">
            <p className="text-on-surface text-lg font-bold">
              {dragActive ? "Drop to upload" : "Drag & drop your document"}
            </p>
            <p className="text-on-surface-variant text-sm">PDF, DOCX or TXT · up to 16MB</p>
          </div>
        )}

        {!isUploading && (
          <span className="btn-primary pointer-events-none">
            <span className="material-symbols-outlined text-lg">folder_open</span>
            Browse files
          </span>
        )}
      </div>

      {error && (
        <div role="alert" className="p-4 bg-error/10 border border-error/30 rounded-lg text-error text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-lg">error</span>
          <div>
            <p className="font-semibold">Upload failed</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
