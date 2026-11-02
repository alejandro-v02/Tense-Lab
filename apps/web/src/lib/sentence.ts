import type { BuildableSentence, WordFunction } from "@tense-lab/shared";

export const FUNCTION_COLOR_VAR: Record<WordFunction, string> = {
  subject: "--color-fn-subject",
  auxiliary: "--color-fn-auxiliary",
  verb: "--color-fn-verb",
  complement: "--color-fn-complement",
  time: "--color-fn-time",
  adverb: "--color-fn-adverb",
  connector: "--color-fn-connector",
};

export function normalizeAnswer(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.?!]+$/, "");
}

/** All English renderings of `sentence` that should count as correct (canonical order plus any accepted alternates). */
export function buildCanonicalSentences(sentence: BuildableSentence): string[] {
  const orders = [sentence.blocks.map((_, i) => i), ...(sentence.acceptedOrders ?? [])];
  return orders.map((order) => order.map((i) => sentence.blocks[i].text).join(" "));
}

export function matchesSentence(answer: string, sentence: BuildableSentence): boolean {
  const normalizedAnswer = normalizeAnswer(answer);
  return buildCanonicalSentences(sentence).some((candidate) => normalizeAnswer(candidate) === normalizedAnswer);
}

/** Index of the block to blank out for the "Completar" exercise: the auxiliary if there is one, else the verb. */
export function pickBlankIndex(sentence: BuildableSentence): number {
  const auxIndex = sentence.blocks.findIndex((b) => b.function === "auxiliary");
  if (auxIndex !== -1) return auxIndex;
  const verbIndex = sentence.blocks.findIndex((b) => b.function === "verb");
  return verbIndex === -1 ? 0 : verbIndex;
}
