import type { ErrorCategory, ErrorSeverity, PositionedError } from "@tense-lab/shared";

export const ERROR_CATEGORY_COLOR_VAR: Record<ErrorCategory, string> = {
  conjugation: "--color-err-conjugation",
  auxiliary: "--color-err-auxiliary",
  participle: "--color-err-participle",
  word_order: "--color-err-word-order",
  preposition: "--color-err-preposition",
  article: "--color-err-article",
  subject_verb_agreement: "--color-err-agreement",
  vocabulary: "--color-err-vocabulary",
  spelling: "--color-err-spelling",
  punctuation: "--color-err-punctuation",
  wrong_tense: "--color-err-wrong-tense",
  other: "--color-err-other",
};

export const ERROR_CATEGORY_LABEL: Record<ErrorCategory, string> = {
  conjugation: "Conjugación",
  auxiliary: "Auxiliar",
  participle: "Participio",
  word_order: "Orden de palabras",
  preposition: "Preposición",
  article: "Artículo",
  subject_verb_agreement: "Concordancia sujeto-verbo",
  vocabulary: "Vocabulario",
  spelling: "Ortografía",
  punctuation: "Puntuación",
  wrong_tense: "Tiempo verbal incorrecto",
  other: "Otro",
};

export const ERROR_SEVERITY_LABEL: Record<ErrorSeverity, string> = {
  minor: "Leve",
  moderate: "Moderado",
  major: "Grave",
};

export interface HighlightSegment {
  text: string;
  error: PositionedError | null;
}

/**
 * Splits `text` into plain and error-highlighted segments from the errors'
 * start/end offsets. Errors that couldn't be located (start === end) and
 * overlapping ranges are skipped defensively rather than crashing the render.
 */
export function buildHighlightSegments(text: string, errors: PositionedError[]): HighlightSegment[] {
  const located = errors.filter((e) => e.end > e.start).sort((a, b) => a.start - b.start);

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const error of located) {
    const start = Math.max(error.start, cursor);
    const end = Math.max(error.end, start);
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), error: null });
    }
    if (end > start) {
      segments.push({ text: text.slice(start, end), error });
      cursor = end;
    }
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), error: null });
  }
  return segments;
}

export function scoreColorVar(score: number): string {
  if (score >= 80) return "--color-success";
  if (score >= 50) return "--color-accent";
  return "--color-danger";
}
