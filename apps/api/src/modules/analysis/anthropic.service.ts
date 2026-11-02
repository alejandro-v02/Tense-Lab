import { Injectable } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";
import {
  ERROR_CATEGORIES,
  ERROR_SEVERITIES,
  TENSES,
  parseAiAnalysisResponse,
  type AiAnalysisResponse,
  type AnalysisMode,
  type Tense,
} from "@tense-lab/shared";

const REPORT_TOOL_NAME = "report_analysis";

const REPORT_TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    score: { type: "number", description: "Overall writing quality for this text, 0-100." },
    summary: {
      type: "string",
      description: "A short summary in Spanish of how the student did, 1-3 sentences.",
    },
    correctedText: { type: "string", description: "The full text rewritten with every error fixed, in English." },
    detectedTenses: {
      type: "array",
      items: { type: "string", enum: TENSES },
      description: "Every tense actually used in the student's text.",
    },
    errors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          quote: {
            type: "string",
            description: "The exact substring from the student's original text that contains the error.",
          },
          occurrence: {
            type: "integer",
            minimum: 1,
            description: "If `quote` appears more than once in the text, which occurrence this is (1 = first).",
          },
          category: { type: "string", enum: ERROR_CATEGORIES },
          usedTense: { type: ["string", "null"], enum: [...TENSES, null] },
          expectedTense: { type: ["string", "null"], enum: [...TENSES, null] },
          severity: { type: "string", enum: ERROR_SEVERITIES },
          explanation: { type: "string", description: "Why this is wrong, in Spanish, written for a learner." },
          rule: { type: "string", description: "The short grammar rule this breaks, in Spanish." },
          correction: { type: "string", description: "The corrected version of `quote`, in English." },
        },
        required: ["quote", "occurrence", "category", "severity", "explanation", "rule", "correction"],
      },
    },
  },
  required: ["score", "summary", "correctedText", "detectedTenses", "errors"],
};

function systemPrompt(mode: AnalysisMode, targetTense?: Tense): string {
  const focus = targetTense
    ? `The student is practicing ${targetTense.replace(/_/g, " ")}, so pay special attention to errors involving that tense, but report every error you find regardless of tense.`
    : "Report every grammar, vocabulary, spelling, and punctuation error you find.";

  return [
    "You are an English grammar tutor for Spanish-speaking students, analyzing a short piece of their writing.",
    `The text is a ${mode === "sentence" ? "single sentence" : mode === "paragraph" ? "short paragraph" : "free-form piece of writing"}.`,
    focus,
    "For every error, `quote` must be copied verbatim (same casing, same characters) from the student's text — it is used to locate the error, so do not paraphrase it.",
    "Write `explanation`, `rule`, and `summary` in Spanish, since the student is a Spanish speaker. Write `correctedText` and `correction` in English.",
    "If the text has no errors, return an empty `errors` array and a high score.",
    "Call the report_analysis tool with your findings; do not respond with plain text.",
  ].join(" ");
}

@Injectable()
export class AnthropicService {
  private readonly client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  pickModel(mode: AnalysisMode): string {
    const small = process.env.AI_MODEL_SMALL ?? "claude-haiku-5-5";
    const large = process.env.AI_MODEL_LARGE ?? "claude-sonnet-5-5";
    return mode === "sentence" ? small : large;
  }

  async analyzeText(
    text: string,
    mode: AnalysisMode,
    targetTense?: Tense,
  ): Promise<{ analysis: AiAnalysisResponse; model: string }> {
    const model = this.pickModel(mode);

    const response = await this.client.messages.create({
      model,
      max_tokens: 2048,
      system: systemPrompt(mode, targetTense),
      messages: [{ role: "user", content: text }],
      tools: [{ name: REPORT_TOOL_NAME, description: "Report the writing analysis.", input_schema: REPORT_TOOL_SCHEMA }],
      tool_choice: { type: "tool", name: REPORT_TOOL_NAME },
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    const analysis = parseAiAnalysisResponse(toolUse?.type === "tool_use" ? toolUse.input : null);

    return { analysis, model };
  }
}
