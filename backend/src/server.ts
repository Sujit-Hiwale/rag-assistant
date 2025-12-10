import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

import uploadRoute from "./routes/upload";
import processRoute from "./routes/process";
import answerRoute from "./routes/answer";
import { loadHistory, saveHistory, clearHistory } from "./history/history";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Ensure folders
const UPLOADS = path.join(process.cwd(), "uploads");
const VECTOR_IDX = path.join(process.cwd(), "vector_index");
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS);
if (!fs.existsSync(VECTOR_IDX)) fs.mkdirSync(VECTOR_IDX);

app.use("/upload", uploadRoute);
app.use("/process", processRoute);
app.use("/answer", answerRoute);

// history endpoints (persistent chat history)
app.get("/history", (req, res) => {
  res.json(loadHistory());
});
app.post("/history", (req, res) => {
  const { messages } = req.body;
  saveHistory(messages || []);
  res.json({ ok: true });
});
app.delete("/history", (req, res) => {
  clearHistory();
  res.json({ ok: true });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
