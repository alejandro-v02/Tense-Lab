import { randomUUID } from "node:crypto";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { SENTENCE_GENERATION_RATE_LIMIT_PER_MINUTE, type BuildableSentence } from "@tense-lab/shared";
import { ContentService } from "../content/content.service";
import { SentenceGeneratorService } from "./sentence-generator.service";

const RATE_LIMIT_WINDOW_MS = 60_000;

@Injectable()
export class PracticeService {
  private readonly logger = new Logger(PracticeService.name);
  private readonly requestLog = new Map<string, number[]>();

  constructor(
    private readonly content: ContentService,
    private readonly generator: SentenceGeneratorService,
  ) {}

  async generateSentence(userId: string, unitId: string, avoid: string[]): Promise<BuildableSentence> {
    this.enforceRateLimit(userId);
    const unit = this.content.getUnit(unitId);

    try {
      const sentence = await this.generator.generate(unit, avoid, `${unitId}_ai_${randomUUID()}`);
      if (!sentence) {
        throw new Error("The AI returned an unusable sentence.");
      }
      return sentence;
    } catch (error) {
      this.logger.warn(`Sentence generation failed for unit ${unitId}`, error instanceof Error ? error.stack : error);
      throw new HttpException("No se pudo generar una oración nueva.", HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  private enforceRateLimit(userId: string): void {
    const now = Date.now();
    const timestamps = (this.requestLog.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (timestamps.length >= SENTENCE_GENERATION_RATE_LIMIT_PER_MINUTE) {
      throw new HttpException("Demasiadas oraciones seguidas. Esperá un momento.", HttpStatus.TOO_MANY_REQUESTS);
    }
    timestamps.push(now);
    this.requestLog.set(userId, timestamps);
  }
}
