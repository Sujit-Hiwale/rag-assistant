import axios from "axios";

export async function embedText(text: string): Promise<number[]> {
  const res = await axios.post("http://localhost:11434/api/embeddings", {
    model: "llama3.2:1b",
    prompt: text
  }, { timeout: 120_000 });

  if (!res.data || !res.data.embedding) {
    throw new Error("Embedding failed");
  }
  return res.data.embedding as number[];
}
