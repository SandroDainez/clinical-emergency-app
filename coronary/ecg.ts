import type { CoronarySnapshot } from "./domain";
import { CORONARY_WINDOWS } from "./protocol-config";

function parseTimeToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function computeDoorToEcg(arrival: string, ecg: string) {
  const start = parseTimeToMinutes(arrival);
  const end = parseTimeToMinutes(ecg);
  if (start == null || end == null) return null;
  return end >= start ? end - start : end + 1440 - start;
}

export function interpretEcg(snapshot: CoronarySnapshot) {
  const doorToEcg = computeDoorToEcg(snapshot.pain.arrivalTime, snapshot.ecg.firstEcgTime);
  const hasStemiPattern =
    snapshot.ecg.stElevation === "yes" ||
    (snapshot.ecg.newBundleBranchBlock === "yes" && snapshot.ecg.inconclusive !== "yes");

  return {
    doorToEcg,
    hasStemiPattern,
    needsAdditionalLeads:
      snapshot.ecg.inferior === "yes" || snapshot.ecg.posterior === "yes" || snapshot.ecg.rvInvolvement === "yes" || snapshot.ecg.additionalLeadsNeeded === "yes",
    delayed:
      doorToEcg != null && doorToEcg > CORONARY_WINDOWS.firstEcgTargetMin,
  };
}
