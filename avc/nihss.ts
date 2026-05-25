import { NIHSS_ITEMS } from "./protocol-config";

export function computeNihssTotal(scores: Record<string, number | null>) {
  return NIHSS_ITEMS.reduce((sum, item) => sum + (scores[item.id] ?? 0), 0);
}

export function isNihssComplete(scores: Record<string, number | null>) {
  return NIHSS_ITEMS.every((item) => scores[item.id] != null);
}

export function classifyNihss(total: number) {
  if (total <= 0) return "Sem déficit mensurável";
  if (total <= 4) return "AVC leve";
  if (total <= 9) return "AVC leve a moderado";
  if (total <= 15) return "AVC moderado";
  if (total <= 20) return "AVC moderado a grave";
  return "AVC grave";
}

export function hasPotentiallyDisablingDeficit(scores: Record<string, number | null>) {
  return (
    (scores.nihss5a ?? 0) >= 2 ||
    (scores.nihss5b ?? 0) >= 2 ||
    (scores.nihss6a ?? 0) >= 2 ||
    (scores.nihss6b ?? 0) >= 2 ||
    (scores.nihss9 ?? 0) >= 1 ||
    (scores.nihss3 ?? 0) >= 1 ||
    (scores.nihss10 ?? 0) >= 1
  );
}
