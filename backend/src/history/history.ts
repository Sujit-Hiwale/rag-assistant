import fs from "fs";
import path from "path";

const HISTORY_FILE = path.join(process.cwd(), "history.json");

export function loadHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
  } catch {
    return [];
  }
}

export function saveHistory(messages: any[]) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(messages || [], null, 2));
}

export function clearHistory() {
  saveHistory([]);
}
