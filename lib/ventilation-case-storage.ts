/**
 * Draft storage for the mechanical ventilation module.
 * Uses localStorage on web with a graceful in-memory fallback.
 */

const STORAGE_KEY = "ventilation_case_draft_v1";
let memoryStorageValue: string | null = null;

function readRaw(): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }

  return memoryStorageValue;
}

function writeRaw(value: string | null) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      if (value == null) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }
      window.localStorage.setItem(STORAGE_KEY, value);
      return;
    }
  } catch {
    // ignore
  }

  memoryStorageValue = value;
}

function loadVentilationDraft<T>(): T | null {
  const raw = readRaw();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveVentilationDraft<T>(draft: T) {
  writeRaw(JSON.stringify(draft));
}

function clearVentilationDraft() {
  writeRaw(null);
}

export { clearVentilationDraft, loadVentilationDraft, saveVentilationDraft };
