export function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
  if (!text) return [];
  const tokens = text.split(/\s+/);
  const chunks: string[] = [];
  let start = 0;
  while (start < tokens.length) {
    const end = Math.min(tokens.length, start + chunkSize);
    const piece = tokens.slice(start, end).join(" ");
    // skip tiny pieces
    if (piece.trim().length > 30) chunks.push(piece.trim());
    if (end === tokens.length) break;
    start = end - overlap;
    if (start < 0) start = 0;
  }
  return chunks;
}
