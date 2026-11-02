import { useEffect, useRef, useState } from "react";
import { pickNextSentences, type BuildableSentence, type Unit } from "@tense-lab/shared";
import { api } from "../lib/api";

const RECENT_TEXTS_LIMIT = 10;

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

/** Picks one sentence from the hand-authored bank without repeating until it's exhausted. */
function pickFromBank(unitId: string, sentences: BuildableSentence[]): BuildableSentence | null {
  if (sentences.length === 0) return null;
  const pool = sentences.map((s) => s.id);
  const seen = loadSeenIds(unitId);
  const { selected, seenIds } = pickNextSentences(pool, seen, 1);
  saveSeenIds(unitId, seenIds);
  return sentences.find((s) => s.id === selected[0]) ?? sentences[0];
}

/**
 * Hands out one practice sentence at a time, preferring a freshly AI-generated
 * one (so the same sentences don't keep recurring) and falling back to the
 * hand-authored bank — with its own no-repeat shuffle — whenever generation
 * fails or no API key is configured.
 */
export function useSentencePractice(unit: Unit | undefined) {
  const [current, setCurrent] = useState<BuildableSentence | null>(null);
  const [loading, setLoading] = useState(false);
  const recentTexts = useRef<string[]>([]);
  const requestId = useRef(0);

  const next = async () => {
    if (!unit) return;
    const id = ++requestId.current;
    setLoading(true);

    let sentence: BuildableSentence | null = null;
    try {
      sentence = await api.generateSentence(unit.id, recentTexts.current);
    } catch {
      sentence = pickFromBank(unit.id, unit.sentences);
    }
    if (!sentence) {
      sentence = pickFromBank(unit.id, unit.sentences);
    }

    if (id !== requestId.current) return; // a newer call already landed

    if (sentence) {
      recentTexts.current = [sentence.spanish, ...recentTexts.current].slice(0, RECENT_TEXTS_LIMIT);
    }
    setCurrent(sentence);
    setLoading(false);
  };

  useEffect(() => {
    recentTexts.current = [];
    void next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit?.id]);

  return { current, loading, next };
}
