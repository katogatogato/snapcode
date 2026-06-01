const STORAGE_KEY = "snapcode_history";
const MAX_ENTRIES = 10;

interface HistoryEntry {
  id: string;
  code: string;
  language: string;
  timestamp: number;
  preview: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function makePreview(code: string): string {
  const firstLine = code.split("\n").find((line) => line.trim().length > 0);
  if (!firstLine) return "(empty)";
  return firstLine.length > 60 ? firstLine.slice(0, 60) + "..." : firstLine;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry: unknown): entry is HistoryEntry =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as Record<string, unknown>).id === "string" &&
        typeof (entry as Record<string, unknown>).code === "string"
    );
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function addEntry(code: string, language: string): HistoryEntry {
  const entries = loadHistory();
  const entry: HistoryEntry = {
    id: generateId(),
    code,
    language,
    timestamp: Date.now(),
    preview: makePreview(code),
  };
  entries.unshift(entry);
  saveHistory(entries.slice(0, MAX_ENTRIES));
  return entry;
}

function removeEntry(id: string): void {
  const entries = loadHistory().filter((e) => e.id !== id);
  saveHistory(entries);
}

function clearAllHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
