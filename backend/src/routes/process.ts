import express from "express";
import path from "path";
import fs from "fs";
import pdfParse from "pdf-parse";
import { cleanText } from "../utils/cleanText";
import { chunkText } from "../utils/chunkText";
import { embedText } from "../utils/embed";
import { VectorStore } from "../utils/vectorStore";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) return res.status(400).json({ error: "Missing fileName" });

    const filePath = path.join(process.cwd(), "uploads", fileName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const cleaned = cleanText(data.text || "");
    const chunks = chunkText(cleaned);

    const processedDir = path.join(process.cwd(), "uploads", "processed");
    if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

    // save cleaned text and chunk files
    fs.writeFileSync(path.join(processedDir, fileName + ".txt"), cleaned);
    const chunkMap = chunks.map((c, i) => ({ id: i, text: c }));
    fs.writeFileSync(path.join(processedDir, fileName + ".chunks.json"), JSON.stringify(chunks, null, 2));
    fs.writeFileSync(path.join(processedDir, fileName + ".chunkmap.json"), JSON.stringify(chunkMap, null, 2));

    // Embedding + vector store
    // IMPORTANT: choose dimension that matches your embedding model. For llama3.2:1b embeddings -> typically 1024
    const EMB_DIM = 2048;
    const vs = new VectorStore(EMB_DIM);

    let id = 0;
    for (const chunk of chunks) {
      const emb = await embedText(chunk);
      if (!emb || emb.length !== EMB_DIM) {
        console.warn("embedding length mismatch", emb?.length);
        // You can normalize or convert here if needed
      }
      vs.add(id, emb);
      id++;
    }

    // save index
    const idxName = fileName + ".hnsw";
    vs.save(idxName);

    console.log(`Process file's length: ${cleaned.length}`);
    console.log(`Process chunk's length: ${chunks.length}`);
    console.log("Embeddings + HNSW index saved.");

    res.json({
      message: "File processed and chunks created successfully",
      totalChunks: chunks.length,
      chunkFile: fileName + ".chunks.json",
      indexFile: idxName
    });
  } catch (err: any) {
    console.error("PROCESS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
