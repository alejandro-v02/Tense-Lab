import { z } from "zod";
import { WORD_FUNCTIONS, type BuildableSentence } from "./content.js";

const blockSchema = z.object({
  text: z.string().catch(""),
  function: z.enum(WORD_FUNCTIONS).catch("complement"),
});

const generatedSentenceSchema = z
  .object({
    spanish: z.string().catch(""),
    blocks: z.array(blockSchema).catch([]),
    endMark: z.enum([".", "?", "!"]).catch("."),
  })
  .catch({ spanish: "", blocks: [], endMark: "." });

/**
 * Permissively parses an AI-generated practice sentence. Returns null if the
 * result isn't usable (empty prompt, or fewer than two blocks to order),
 * so the caller can fall back to the hand-authored sentence bank instead.
 */
export function parseGeneratedSentence(raw: unknown, id: string): BuildableSentence | null {
  const parsed = generatedSentenceSchema.parse(raw);
  if (!parsed.spanish.trim() || parsed.blocks.length < 2 || parsed.blocks.some((b) => !b.text.trim())) {
    return null;
  }
  return { id, spanish: parsed.spanish, blocks: parsed.blocks, endMark: parsed.endMark };
}
