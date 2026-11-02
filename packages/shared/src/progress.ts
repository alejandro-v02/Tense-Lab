import type { Tense } from "./tenses.js";

export const XP_REWARDS = {
  correctAnswer: 10,
  writingAnalysis: 20,
  vocabularyReview: 2,
} as const;

export const PROGRESS_RULES = {
  /** Minimum accuracy (0-1) and attempts in a unit required to unlock the next one. */
  unlockNext: { minAccuracy: 0.7, minAttempts: 8 },
  /** Minimum accuracy (0-1) and attempts in a unit required to mark it completed. */
  complete: { minAccuracy: 0.8, minAttempts: 16 },
} as const;

export const STREAK_TIMEZONE = "America/Bogota";

export const UNIT_STATUSES = ["locked", "in_progress", "completed"] as const;
export type UnitStatus = (typeof UNIT_STATUSES)[number];

export interface UnitProgress {
  unitId: Tense;
  correct: number;
  total: number;
  accuracy: number;
  status: UnitStatus;
}

export function unlocksNext(progress: Pick<UnitProgress, "correct" | "total">): boolean {
  const accuracy = progress.total > 0 ? progress.correct / progress.total : 0;
  return accuracy >= PROGRESS_RULES.unlockNext.minAccuracy && progress.total >= PROGRESS_RULES.unlockNext.minAttempts;
}

/**
 * `previousUnit` is this unit's predecessor in the 12-unit path, or `undefined`
 * for unit 1, which is always unlocked.
 */
export function computeUnitStatus(
  ownProgress: Pick<UnitProgress, "correct" | "total">,
  previousUnit: Pick<UnitProgress, "correct" | "total"> | undefined,
): UnitStatus {
  const isUnlocked = previousUnit === undefined || unlocksNext(previousUnit);
  if (!isUnlocked) {
    return "locked";
  }

  const accuracy = ownProgress.total > 0 ? ownProgress.correct / ownProgress.total : 0;
  const isCompleted =
    accuracy >= PROGRESS_RULES.complete.minAccuracy && ownProgress.total >= PROGRESS_RULES.complete.minAttempts;

  return isCompleted ? "completed" : "in_progress";
}
