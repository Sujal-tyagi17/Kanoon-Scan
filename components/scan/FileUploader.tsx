"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

export default function FileUploader() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-4 py-16 transition-all hover:bg-surface-variant/20 hover:border-primary/50 group">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-primary text-4xl">
            cloud_upload
          </span>
        </div>
        <div className="text-center space-y-2">
          <p className="text-on-surface text-lg font-bold">Drop your legal document here</p>
          <p className="text-on-surface-variant text-sm">
            PDF, DOCX, or TXT files up to 16MB
          </p>
        </div>
        
        <UploadButton<OurFileRouter, "documentUploader">
          endpoint="documentUploader"
          onClientUploadComplete={async (res) => {
            if (!res || res.length === 0) {
              setError("Upload failed");
              return;
            }

            const file = res[0];
            setIsUploading(true);
            setError(null);

            try {
              // Process the document (extract text)
              const processResponse = await fetch("/api/process-document", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fileUrl: file.url,
                  fileName: file.name,
                  fileType: file.type,
                }),
              });

              if (!processResponse.ok) {
                throw new Error("Failed to process document");
              }

              const { documentId } = await processResponse.json();

              // Redirect to analyzing page with document ID
              router.push(`/scan/analyzing?documentId=${documentId}`);
            } catch (err) {
              console.error("Error processing document:", err);
              setError("Failed to process document. Please try again.");
              setIsUploading(false);
            }
          }}
          onUploadError={(error: Error) => {
            setError(`Upload error: ${error.message}`);
            setIsUploading(false);
          }}
          appearance={{
            button: "bg-primary-container text-white px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all w-full md:w-auto cursor-pointer",
            allowedContent: "hidden",
          }}
          content={{
            button: isUploading ? (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">folder_open</span>
                Browse Files
              </div>
            ),
          }}
        />
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
