// LocalStorage-backed history of generated quote sets.

const KEY = "qg_history_v1";
const MAX_ENTRIES = 30;

export function loadHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveHistoryEntry({ topic, quotes }) {
  if (typeof window === "undefined") return [];
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    topic,
    quotes,
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...loadHistory()].slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    // storage full / disabled — ignore
  }
  return next;
}

export function deleteHistoryEntry(id) {
  const next = loadHistory().filter((e) => e.id !== id);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {}
  return next;
}

export function clearHistory() {
  try {
    window.localStorage.removeItem(KEY);
  } catch (e) {}
  return [];
}

export function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "";
  }
}
