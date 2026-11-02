export interface SentencePickResult {
  selected: string[];
  /** IDs already shown in the current cycle through the pool, to persist and pass back in on the next call. */
  seenIds: string[];
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Picks `count` sentence IDs from `poolIds` without repeating one until the whole
 * pool has been shown once (a "shuffle bag"). Once the pool is exhausted mid-pick,
 * it reshuffles and starts a new cycle, avoiding an immediate repeat of the last
 * sentence shown when the pool has more than one item.
 *
 * `seenIds` is the caller's persisted state (e.g. per user + unit); pass back
 * `result.seenIds` on the next call.
 */
export function pickNextSentences(
  poolIds: string[],
  seenIds: string[],
  count: number,
  rng: () => number = Math.random,
): SentencePickResult {
  if (poolIds.length === 0 || count <= 0) {
    return { selected: [], seenIds };
  }

  let remaining = poolIds.filter((id) => !seenIds.includes(id));
  let updatedSeen = [...seenIds];
  const selected: string[] = [];

  while (selected.length < count) {
    if (remaining.length === 0) {
      updatedSeen = [];
      remaining = shuffle(poolIds, rng);
      const last = selected[selected.length - 1];
      if (last !== undefined && remaining.length > 1 && remaining[0] === last) {
        [remaining[0], remaining[1]] = [remaining[1], remaining[0]];
      }
    }

    const next = remaining.shift();
    if (next === undefined) {
      break;
    }
    selected.push(next);
    updatedSeen.push(next);
  }

  return { selected, seenIds: updatedSeen };
}
