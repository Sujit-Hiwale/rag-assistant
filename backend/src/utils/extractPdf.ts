// backend/src/utils/extractPdf.ts
import pdfParse from "pdf-parse";

/**
 * Extract text from a Buffer containing PDF bytes.
 * Returns the extracted text (string).
 */
export async function extractPdf(buffer: Buffer): Promise<string> {
  // pdf-parse returns { text, info, numpages, etc. }
  const data = await pdfParse(buffer);
  // ensure we return a string always
  return String(data.text || "");
}