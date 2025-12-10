import express from "express";
import fs from "fs";
import path from "path";
import { embedText } from "../utils/embed";
import { VectorStore } from "../utils/vectorStore";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question, fileName, topK = 3 } = req.body;

    if (!question || !fileName)
      return res.status(400).json({ error: "Missing question or fileName" });

    const chunkMapPath = path.join(
      process.cwd(),
      "uploads",
      "processed",
      fileName + ".chunkmap.json"
    );

    if (!fs.existsSync(chunkMapPath))
      return res.status(404).json({ error: "Chunk map not found" });

    const chunkMap = JSON.parse(fs.readFileSync(chunkMapPath, "utf8"));

    const vectorStore = new VectorStore(768);
    const indexName = fileName + ".hnsw";

    if (!vectorStore.load(indexName))
      return res.status(404).json({ error: "Vector index not found" });

    const queryEmbedding = await embedText(question);

    const result = vectorStore.search(queryEmbedding, topK);

    console.log("Search result:", result);

    const matchedChunks = result.neighbors.map((id: number) => {
      return chunkMap.find((c: any) => c.id === id);
    });

    res.json({
      question,
      topK,
      results: matchedChunks
    });

  } catch (err: any) {
    console.error("QUERY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;