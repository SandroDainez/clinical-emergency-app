/**
 * vasoactive-storage.ts
 *
 * Persists user-saved custom dilutions for the vasoactive calculator.
 * Uses localStorage on web (Expo web / browser) with a graceful fallback
 * for environments where it is unavailable.
 */

export type SavedDilution = {
  id: string;
  drugKey: string;
  label: string;       // user-chosen name, e.g. "UTI protocol — 32 mcg/mL"
  ampoules: number;
  diluentMl: number;
  diluent: "SF" | "SG";
  savedAt: string;     // ISO date string
};

const STORAGE_KEY = "vasoactive_saved_dilutions_v1";

function readAll(): SavedDilution[] {
  try {
    const raw = typeof localStorage !== "undefined"
      ? localStorage.getItem(STORAGE_KEY)
      : null;
    if (!raw) return [];
    return JSON.parse(raw) as SavedDilution[];
  } catch {
    return [];
  }
}

function writeAll(items: SavedDilution[]): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
    // Storage unavailable — silently ignore
  }
}

export function getSavedDilutions(drugKey: string): SavedDilution[] {
  return readAll().filter((d) => d.drugKey === drugKey);
}

export function saveDilution(
  drugKey: string,
  label: string,
  ampoules: number,
  diluentMl: number,
  diluent: "SF" | "SG"
): SavedDilution {
  const all = readAll();
  const entry: SavedDilution = {
    id: `${drugKey}_${Date.now()}`,
    drugKey,
    label,
    ampoules,
    diluentMl,
    diluent,
    savedAt: new Date().toISOString().split("T")[0],
  };
  writeAll([...all, entry]);
  return entry;
}

export function deleteSavedDilution(id: string): void {
  writeAll(readAll().filter((d) => d.id !== id));
}
