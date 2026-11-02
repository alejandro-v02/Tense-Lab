export const ERROR_CATEGORIES = [
  "conjugation",
  "auxiliary",
  "participle",
  "word_order",
  "preposition",
  "article",
  "subject_verb_agreement",
  "vocabulary",
  "spelling",
  "punctuation",
  "wrong_tense",
  "other",
] as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];

export const ERROR_SEVERITIES = ["minor", "moderate", "major"] as const;
export type ErrorSeverity = (typeof ERROR_SEVERITIES)[number];

export function isErrorCategory(value: string): value is ErrorCategory {
  return (ERROR_CATEGORIES as readonly string[]).includes(value);
}

export function isErrorSeverity(value: string): value is ErrorSeverity {
  return (ERROR_SEVERITIES as readonly string[]).includes(value);
}
