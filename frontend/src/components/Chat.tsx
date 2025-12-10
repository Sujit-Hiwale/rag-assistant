import React, { useEffect, useState, useRef } from "react";
import type { Message } from "../types";
import { API } from "../lib/api";

export default function Chat({ fileName }: { fileName: string | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  // Load saved history
  useEffect(() => {
    fetch(`${API}/history`)
      .then((r) => r.json())
      .then((m) => setMessages(m || []));
  }, []);

  // Save on every change
  useEffect(() => {
    fetch(`${API}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    if (!fileName) return alert("Upload a file first");
    if (!input.trim()) return;

    const id = crypto.randomUUID();
    setMessages((s) => [...s, { id, role: "user", text: input }]);
    const question = input;
    setInput("");

    // Request streaming SSE
    const res = await fetch(`${API}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, fileName }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "unknown" }));
      alert("Server error: " + (err.error || res.statusText));
      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    const assistantId = crypto.randomUUID();
    setMessages((s) => [...s, { id: assistantId, role: "assistant", text: "" }]);

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const l of lines) {
        const trimmed = l.trim();
        if (!trimmed.startsWith("data:")) continue;

        const data = trimmed.replace(/^data:\s*/, "");
        if (data === "[DONE]") break;

        // Append streamed token
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: smartAppend(m.text, data) } : m
          )
        );
      }
    }
  }

  function smartAppend(prev: string, token: string): string {
    if (/^[.,!?]/.test(token)) return prev + token;
    if (prev.endsWith(" ")) return prev + token;
    return prev + " " + token;
  }

  async function clearHistory() {
    await fetch(`${API}/history`, { method: "DELETE" });
    setMessages([]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      
      {/* HEADER */}
      <div
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          borderBottom: "1px solid #ddd",
          background: "white",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20 }}>Notebook Chat</h2>
      </div>

      {/* CHAT MESSAGES */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 40px",
          background: "#f7f7f8",
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                maxWidth: "65%",
                padding: "12px 16px",
                borderRadius: 16,
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
                background:
                  m.role === "user" ? "white" : "rgba(225,236,255,0.9)",
                border: "1px solid #ddd",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT BAR */}
      <div
        style={{
          padding: 20,
          borderTop: "1px solid #ddd",
          background: "white",
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything from your document..."
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            background: "#f0f0f0",
          }}
        />

        <button
          onClick={send}
          style={{
            padding: "10px 18px",
            background: "black",
            color: "white",
            borderRadius: 10,
          }}
        >
          Send
        </button>

        <button
          onClick={clearHistory}
          style={{
            padding: "10px 18px",
            background: "#ff4d4f",
            color: "white",
            borderRadius: 10,
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
