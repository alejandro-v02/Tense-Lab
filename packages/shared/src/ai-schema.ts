import { z } from "zod";
import { ERROR_CATEGORIES, ERROR_SEVERITIES } from "./errors.js";
import { TENSES } from "./tenses.js";

const tenseEnum = z.enum(TENSES);
const categoryEnum = z.enum(ERROR_CATEGORIES);
const severityEnum = z.enum(ERROR_SEVERITIES);

export const aiErrorSchema = z.object({
  quote: z.string().catch(""),
  occurrence: z.number().int().positive().catch(1),
  category: categoryEnum.catch("other"),
  usedTense: tenseEnum.nullable().catch(null),
  expectedTense: tenseEnum.nullable().catch(null),
  severity: severityEnum.catch("moderate"),
  explanation: z.string().catch(""),
  rule: z.string().catch(""),
  correction: z.string().catch(""),
});

export type AiError = z.infer<typeof aiErrorSchema>;

const aiTopLevelSchema = z
  .object({
    score: z.number().min(0).max(100).catch(100),
    summary: z.string().catch(""),
    correctedText: z.string().catch(""),
    detectedTenses: z.array(tenseEnum).catch([]),
  })
  .catch({ score: 100, summary: "", correctedText: "", detectedTenses: [] });

export interface AiAnalysisResponse {
  score: number;
  summary: string;
  correctedText: string;
  detectedTenses: (typeof TENSES)[number][];
  errors: AiError[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Permissively parses the AI's JSON response: an invalid field falls back to a
 * default instead of failing the whole analysis, and a malformed error entry
 * (not even a parseable object) is dropped instead of failing the array.
 */
export function parseAiAnalysisResponse(raw: unknown): AiAnalysisResponse {
  const base = aiTopLevelSchema.parse(raw);
  const rawErrors = isRecord(raw) && Array.isArray(raw.errors) ? raw.errors : [];

  const errors: AiError[] = [];
  for (const candidate of rawErrors) {
    const result = aiErrorSchema.safeParse(candidate);
    if (result.success) {
      errors.push(result.data);
    }
  }

  return { ...base, errors };
}
