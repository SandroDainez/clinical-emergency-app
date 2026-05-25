const STORAGE_KEY = "clinical-emergency-app:avc-draft";

export function loadAvcDraft<T>() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null as T | null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveAvcDraft<T>(payload: T) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

export function clearAvcDraft() {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
