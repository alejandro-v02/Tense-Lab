export interface Sm2State {
  /** Easiness factor, starts at 2.5 and never drops below 1.3. */
  easiness: number;
  /** Interval in days until the next review. */
  interval: number;
  /** Consecutive successful repetitions (quality >= 3). Resets to 0 on failure. */
  repetitions: number;
  /** Total number of times quality was below 3. */
  failures: number;
}

export const SM2_INITIAL_STATE: Sm2State = {
  easiness: 2.5,
  interval: 0,
  repetitions: 0,
  failures: 0,
};

export const SM2_MIN_EASINESS = 1.3;

export interface Sm2Result {
  state: Sm2State;
  nextReviewAt: Date;
}

/**
 * SM-2 spaced repetition. `quality` is 0-5 (0 = total blackout, 5 = perfect recall).
 * Shared by vocabulary review and error review, per the project spec.
 */
export function reviewSm2(state: Sm2State, quality: number, now: Date = new Date()): Sm2Result {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new Error("quality must be an integer between 0 and 5");
  }

  let { easiness, interval, repetitions, failures } = state;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
    failures += 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }
    repetitions += 1;
  }

  easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easiness = Math.max(SM2_MIN_EASINESS, easiness);

  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return {
    state: { easiness, interval, repetitions, failures },
    nextReviewAt,
  };
}
