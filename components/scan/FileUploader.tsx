"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function FileUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
      setError("File is too large. Maximum size is 16MB.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/process-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to process document");
      }

      const { documentId } = await response.json();

      // Redirect to analyzing page
      router.push(`/scan/analyzing?documentId=${documentId}`);
    } catch (err: any) {
      console.error("Error processing document:", err);
      setError(err.message || "Failed to process document. Please try again.");
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 py-16 transition-all duration-300 ${
          dragActive
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-outline-variant hover:bg-surface-variant/20 hover:border-primary/50"
        } group relative cursor-pointer`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
          disabled={isUploading}
        />

        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <span className="material-symbols-outlined text-primary text-4xl">
            {isUploading ? "sync" : "cloud_upload"}
          </span>
        </div>
        
        <div className="text-center space-y-2 select-none">
          <p className="text-on-surface text-lg font-bold">
            {isUploading ? "Reading document content..." : "Drop your legal document here"}
          </p>
          <p className="text-on-surface-variant text-sm">
            PDF, DOCX, or TXT files up to 16MB
          </p>
        </div>

        <button
          type="button"
          disabled={isUploading}
          className="bg-primary-container text-white px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all cursor-pointer flex items-center gap-2"
        >
          <span className={`material-symbols-outlined text-lg ${isUploading ? "animate-spin" : ""}`}>
            {isUploading ? "sync" : "folder_open"}
          </span>
          {isUploading ? "Processing..." : "Browse Files"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-error-container/10 border border-error-container/20 rounded-lg text-error text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-lg">error</span>
          <div>
            <p className="font-semibold">Upload Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
