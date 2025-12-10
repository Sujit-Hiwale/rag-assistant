export function cleanText(text: string): string {
  return text
    .replace(/[ \t]+/g, " ")  // collapse spaces/tabs
    .replace(/\n{2,}/g, "\n\n")  // keep paragraph breaks
    .trim();
}
