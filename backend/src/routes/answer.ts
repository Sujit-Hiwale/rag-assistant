import express from "express";
import fs from "fs";
import path from "path";
import axios from "axios";
import { embedText } from "../utils/embed";
import { VectorStore } from "../utils/vectorStore";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question, fileName, topK = 3 } = req.body;
    if (!question || !fileName) return res.status(400).json({ error: "Missing fields" });

    const chunkMapPath = path.join(process.cwd(), "uploads", "processed", fileName + ".chunkmap.json");
    if (!fs.existsSync(chunkMapPath)) return res.status(404).json({ error: "Chunk map not found" });

    const chunkMap = JSON.parse(fs.readFileSync(chunkMapPath, "utf8"));

    const EMB_DIM = 2048;
    const vs = new VectorStore(EMB_DIM);
    if (!vs.load(fileName + ".hnsw")) return res.status(404).json({ error: "Vector index not found" });

    const queryEmbedding = await embedText(question);
    const result: any = vs.search(queryEmbedding, topK);

    // result.neighbors may be array of ids depending on hnswlib-node shape
    const neighborIds = result.neighbors || result.labels || [];
    const contextChunks = neighborIds.map((id: number) => {
      const found = chunkMap.find((c: any) => c.id === id);
      return found ? found.text : "";
    }).filter(Boolean);

    const context = contextChunks.join("\n\n---\n\n");

    const prompt = `
Use ONLY the context below to answer the user's question. If the precise information is not in the context, say "Not found".

Context:
${context}

Question:
${question}
    `;

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const stream = await axios({
      method: "POST",
      url: "http://localhost:11434/api/generate",
      data: {
        model: "llama3.2:1b",
        prompt,
        stream: true
      },
      responseType: "stream",
      timeout: 0
    });

    let buffer = "";

    stream.data.on("data", (chunk: Buffer) => {
      buffer += chunk.toString();

      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // keep incomplete for next round

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const json = JSON.parse(line);

          if (json.done) {
            res.write("data: [DONE]\n\n");
            return;
          }

          if (json.response) {
            const token = cleanToken(json.response);
            res.write(`data: ${token}\n\n`);
          }

        } catch (err) {
          // ignore partial JSON errors
        }
      }
    });

    // Helper function: ensures spacing is correct
    function cleanToken(t: string) {
      // remove weird breaks Ollama sometimes returns
      t = t.replace(/\s+/g, " ");

      // prevent mid-word chunk breaks like "Su" "jit"
      if (/^[a-zA-Z]+$/.test(t) && t.length <= 3) {
        return t; // treat as fragment, frontend will handle it
      }

      return t;
    }

    stream.data.on("end", () => {
      res.end();
    });

    stream.data.on("error", (err: any) => {
      console.error("stream error", err);
      try { res.write("data: [ERROR]\n\n"); } catch (e) {}
      res.end();
    });
  } catch (err: any) {
    console.error("ANSWER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
