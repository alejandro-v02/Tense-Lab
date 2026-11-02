import { Injectable } from "@nestjs/common";
import { WORD_FUNCTIONS, parseGeneratedSentence, type BuildableSentence, type Unit } from "@tense-lab/shared";
import { GeminiClientService } from "../../common/ai/gemini-client.service";

const GENERATE_TOOL_NAME = "generate_sentence";

const GENERATE_TOOL_SCHEMA = {
  type: "object",
  properties: {
    spanish: { type: "string", description: "The Spanish sentence the student is asked to translate/build." },
    blocks: {
      type: "array",
      description:
        "The English sentence split into 3-7 short chunks, IN THE GRAMMATICALLY CORRECT ORDER — this order is the answer key for a drag-and-reorder exercise.",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          function: { type: "string", enum: WORD_FUNCTIONS },
        },
        required: ["text", "function"],
      },
    },
    endMark: { type: "string", enum: [".", "?", "!"] },
  },
  required: ["spanish", "blocks", "endMark"],
};

function systemPrompt(unit: Unit, avoid: string[]): string {
  const lines = [
    `You write a single practice sentence for a Spanish-speaking student learning the English tense "${unit.title}".`,
    `Formula — affirmative: ${unit.formula.affirmative} | negative: ${unit.formula.negative} | question: ${unit.formula.question}.`,
    "Randomly pick the affirmative, negative, or question form — vary it across calls, don't always pick the same one.",
    "Keep vocabulary simple (everyday topics: family, work, school, travel, hobbies) and the sentence short (one clause, 3-7 words in English).",
    "Split the English sentence into short chunks tagged with their grammatical function (subject/auxiliary/verb/complement/time/adverb/connector), given in the correct order.",
    "`spanish` is a natural Spanish translation of the same sentence, used as the prompt the student sees.",
  ];

  if (unit.examples.length > 0) {
    lines.push(`Style reference (do not reuse): ${unit.examples.map((e) => e.english).join(" / ")}`);
  }
  if (avoid.length > 0) {
    lines.push(`The student has already seen these — write something clearly different: ${avoid.join(" | ")}`);
  }
  lines.push("Call the generate_sentence tool with your result; do not respond with plain text.");

  return lines.join(" ");
}

@Injectable()
export class SentenceGeneratorService {
  constructor(private readonly client: GeminiClientService) {}

  async generate(unit: Unit, avoid: string[], id: string): Promise<BuildableSentence | null> {
    const raw = await this.client.callTool({
      model: this.client.modelFor("small"),
      system: systemPrompt(unit, avoid),
      userContent: `Generate one practice sentence for ${unit.title}.`,
      tool: {
        name: GENERATE_TOOL_NAME,
        description: "Report the generated practice sentence.",
        parametersJsonSchema: GENERATE_TOOL_SCHEMA,
      },
    });

    return parseGeneratedSentence(raw, id);
  }
}
