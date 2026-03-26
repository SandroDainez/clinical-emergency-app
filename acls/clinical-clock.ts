const ACLS_CYCLE_DURATION_MS = 120_000;

type ClinicalClock = {
  cycleDurationMs: number;
  cycleStart?: number;
  nextRhythmCheck?: number;
  lastEpinephrineTime?: number;
};

function createClinicalClock(): ClinicalClock {
  return {
    cycleDurationMs: ACLS_CYCLE_DURATION_MS,
  };
}

function startNewCycle(clock: ClinicalClock, cycleStart: number): ClinicalClock {
  return {
    ...clock,
    cycleStart,
    nextRhythmCheck: cycleStart + clock.cycleDurationMs,
  };
}

function clearCycle(clock: ClinicalClock): ClinicalClock {
  return {
    ...clock,
    cycleStart: undefined,
    nextRhythmCheck: undefined,
  };
}

function isCycleComplete(clock: ClinicalClock, at: number) {
  return clock.nextRhythmCheck !== undefined && at >= clock.nextRhythmCheck;
}

function getElapsedTime(clock: ClinicalClock, at: number) {
  if (clock.cycleStart === undefined) {
    return 0;
  }

  return Math.max(0, at - clock.cycleStart);
}

export type { ClinicalClock };
export {
  ACLS_CYCLE_DURATION_MS,
  clearCycle,
  createClinicalClock,
  getElapsedTime,
  isCycleComplete,
  startNewCycle,
};
