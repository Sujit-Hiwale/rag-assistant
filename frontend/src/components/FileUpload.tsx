import React, { useState } from "react";
import { uploadFile, processFile } from "../lib/api";

export default function FileUpload({ onProcessed }: { onProcessed: (name: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("Select a PDF");

    setStatus("Uploading...");
    setProgress(20);

    const up = await uploadFile(file);

    setStatus("Processing...");
    setProgress(60);

    await processFile(up.fileName);

    setStatus("Done");
    setProgress(100);

    setTimeout(() => setProgress(0), 1000); // reset progress after a while
    onProcessed(up.fileName);
  }

  return (
    <div style={{
      maxWidth: 500,
      margin: "20px auto",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      backgroundColor: "#fff",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <form onSubmit={handleSubmit}>
        <label style={{
          display: "block",
          marginBottom: 8,
          fontWeight: 600,
          color: "#333"
        }}>
          Select PDF:
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ marginBottom: 12 }}
        />
        {file && <div style={{ marginBottom: 12, fontSize: 14 }}>Selected: {file.name}</div>}
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: 8,
            backgroundColor: "#4f46e5",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Upload & Process
        </button>
      </form>

      {status && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 4, fontSize: 14, color: "#555" }}>{status}</div>
          <div style={{
            height: 6,
            width: "100%",
            backgroundColor: "#e5e7eb",
            borderRadius: 4,
            overflow: "hidden"
          }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#4f46e5",
              transition: "width 0.3s ease"
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
