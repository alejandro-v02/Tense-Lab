import type { AiError } from "./ai-schema.js";
import type { ErrorCategory } from "./errors.js";
import type { Tense } from "./tenses.js";
import type { UnitProgress } from "./progress.js";

export const ANALYSIS_MODES = ["sentence", "paragraph", "free"] as const;
export type AnalysisMode = (typeof ANALYSIS_MODES)[number];

export const MAX_ANALYSIS_TEXT_LENGTH = 4000;
export const ANALYSIS_RATE_LIMIT_PER_MINUTE = 10;
export const LONG_TEXT_THRESHOLD_CHARS = 400;
export const MIN_WORDS_FOR_POSITION_DIAGNOSTICS = 40;

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  xp: number;
  streakDays: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface AnalysisRequest {
  text: string;
  mode: AnalysisMode;
  unitId?: Tense;
  targetTense?: Tense;
}

/** An AI-reported error, located within the student's text by the backend. */
export interface PositionedError extends AiError {
  id: string;
  start: number;
  end: number;
  /** 0 (start of text) to 1 (end of text). */
  relativePosition: number;
  resolved: boolean;
  createdAt: string;
}

export interface AnalysisResponse {
  id: string;
  score: number;
  summary: string;
  correctedText: string;
  detectedTenses: Tense[];
  errors: PositionedError[];
  wordCount: number;
  model: string;
  createdAt: string;
}

export interface WeaknessPoint {
  tense: Tense;
  category: ErrorCategory;
  count: number;
}

export interface WeeklyTrendPoint {
  weekStart: string;
  errorsPer100Words: number;
}

export interface DiagnosticsResponse {
  totalErrors: number;
  errorsByTenseAndCategory: { tense: Tense; category: ErrorCategory; count: number }[];
  errorsByPosition: { start: number; middle: number; end: number } | null;
  weeklyTrend: WeeklyTrendPoint[];
  topRules: { rule: string; count: number }[];
  topWeaknesses: WeaknessPoint[];
}

export interface ReviewQueueItem {
  error: PositionedError;
  analysisId: string;
}

export interface ResolveErrorResponse {
  id: string;
  resolved: true;
}

export interface VocabCard {
  wordId: string;
  word: string;
  translation: string;
  exampleEn: string;
  exampleEs: string;
  audioAvailable: boolean;
  isNew: boolean;
}

export interface VocabSessionResponse {
  due: VocabCard[];
  new: VocabCard[];
  stats: { dueCount: number; newCount: number; learnedCount: number };
}

export interface VocabReviewRequest {
  wordId: string;
  /** SM-2 quality, 0-5. */
  quality: number;
}

export interface VocabReviewResponse {
  wordId: string;
  nextReviewAt: string;
  interval: number;
}

export interface ProgressResponse {
  xp: number;
  streakDays: number;
  units: UnitProgress[];
}

export interface AttemptRequest {
  unitId: Tense;
  gameId: string;
  correct: number;
  total: number;
}
