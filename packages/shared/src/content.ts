import type { Tense, TenseGroup, TenseTimeframe } from "./tenses.js";

export const WORD_FUNCTIONS = [
  "subject",
  "auxiliary",
  "verb",
  "complement",
  "time",
  "adverb",
  "connector",
] as const;
export type WordFunction = (typeof WORD_FUNCTIONS)[number];

export const TIMELINE_SHAPES = ["point", "range", "repetition"] as const;
export type TimelineShape = (typeof TIMELINE_SHAPES)[number];

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export interface TenseFormula {
  affirmative: string;
  negative: string;
  question: string;
}

export interface SignalWord {
  word: string;
  translation?: string;
}

export interface UnitExample {
  english: string;
  spanish: string;
}

export interface CommonMistake {
  mistake: string;
  correction: string;
  explanation: string;
}

export interface TimelineSpec {
  shape: TimelineShape;
  axisPosition: number;
  referenceMoment: string;
  description?: string;
}

export interface SentenceBlock {
  text: string;
  function: WordFunction;
}

export interface BuildableSentence {
  id: string;
  spanish: string;
  blocks: SentenceBlock[];
  endMark: "." | "?" | "!";
  /** Alternative orderings of `blocks` indices that are also accepted as correct. */
  acceptedOrders?: number[][];
}

export interface Unit {
  id: Tense;
  timeframe: TenseTimeframe;
  group: TenseGroup;
  title: string;
  formula: TenseFormula;
  uses: string[];
  signalWords: SignalWord[];
  examples: UnitExample[];
  commonMistakes: CommonMistake[];
  timeline: TimelineSpec;
  sentences: BuildableSentence[];
  writingTopics: string[];
}

export interface VocabWord {
  id: string;
  word: string;
  partOfSpeech: string;
  translation: string;
  exampleEn: string;
  exampleEs: string;
  level: CefrLevel;
  topic: string;
  unitId?: Tense;
}
