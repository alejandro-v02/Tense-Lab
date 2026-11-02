import { useEffect, useState } from "react";
import { pickNextSentences, type BuildableSentence } from "@tense-lab/shared";

function storageKey(unitId: string): string {
  return `tense-lab:sentence-seen:${unitId}`;
}

function loadSeenIds(unitId: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(unitId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSeenIds(unitId: string, seenIds: string[]): void {
  try {
    localStorage.setItem(storageKey(unitId), JSON.stringify(seenIds));
  } catch {
    // private browsing / quota exceeded: non-repetition just resets more often
  }
}

/**
 * Hands out one sentence at a time from `sentences` without repeating one
 * until the whole pool has been shown, persisted per unit in localStorage.
 * This is a client-side stand-in for the no-repeat practice queue until a
 * backend endpoint owns this state per user.
 */
export function useSentencePractice(unitId: string, sentences: BuildableSentence[]) {
  const [current, setCurrent] = useState<BuildableSentence | null>(null);

  const pickOne = () => {
    if (sentences.length === 0) {
      setCurrent(null);
      return;
    }
    const pool = sentences.map((s) => s.id);
    const seen = loadSeenIds(unitId);
    const { selected, seenIds } = pickNextSentences(pool, seen, 1);
    saveSeenIds(unitId, seenIds);
    setCurrent(sentences.find((s) => s.id === selected[0]) ?? sentences[0]);
  };

  useEffect(() => {
    pickOne();
  }, [unitId, sentences.length]);

  return { current, next: pickOne };
}
