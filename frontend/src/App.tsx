import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import Chat from "./components/Chat";

export default function App() {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      
      {/* LEFT PANEL */}
      <div
        style={{
          width: 320,
          borderRight: "1px solid #ddd",
          padding: 20,
          background: "white",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <h1 style={{ margin: 0 }}>Local RAG Assistant</h1>
        <FileUpload onProcessed={(name) => setFileName(name)} />

        <div style={{ marginTop: 20, opacity: 0.7 }}>
          <small>Uploaded file: {fileName || "None"}</small>
        </div>
      </div>

      {/* RIGHT PANEL — FULL WIDTH CHAT */}
      <div style={{ flex: 1, background: "#f7f7f8" }}>
        <Chat fileName={fileName} />
      </div>
    </div>
  );
}
