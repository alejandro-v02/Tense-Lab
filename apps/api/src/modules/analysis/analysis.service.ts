import { randomUUID } from "node:crypto";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { AiError, AnalysisResponse, PositionedError } from "@tense-lab/shared";
import { ANALYSIS_RATE_LIMIT_PER_MINUTE } from "@tense-lab/shared";
import { AnalysisAiService } from "./analysis-ai.service";
import { Analysis } from "./entities/analysis.entity";
import { CreateAnalysisDto } from "./dto/create-analysis.dto";

const RATE_LIMIT_WINDOW_MS = 60_000;

/** Finds the Nth (1-based) occurrence of `quote` in `text`; null if it isn't there. */
function locate(text: string, quote: string, occurrence: number): { start: number; end: number } | null {
  if (!quote) return null;
  let fromIndex = 0;
  for (let i = 0; i < occurrence; i++) {
    const index = text.indexOf(quote, fromIndex);
    if (index === -1) return null;
    if (i === occurrence - 1) return { start: index, end: index + quote.length };
    fromIndex = index + quote.length;
  }
  return null;
}

function toPositionedError(text: string, error: AiError): PositionedError {
  const position = locate(text, error.quote, error.occurrence);
  const start = position?.start ?? 0;
  const end = position?.end ?? 0;
  return {
    ...error,
    id: randomUUID(),
    start,
    end,
    relativePosition: text.length === 0 ? 0 : start / text.length,
    resolved: false,
    createdAt: new Date().toISOString(),
  };
}

function wordCount(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private readonly requestLog = new Map<string, number[]>();

  constructor(
    @InjectRepository(Analysis) private readonly repo: Repository<Analysis>,
    private readonly ai: AnalysisAiService,
  ) {}

  async analyze(userId: string, dto: CreateAnalysisDto): Promise<AnalysisResponse> {
    this.enforceRateLimit(userId);

    const { analysis, model } = await this.callAi(dto);
    const errors = analysis.errors.map((error) => toPositionedError(dto.text, error));

    const saved = await this.repo.save(
      this.repo.create({
        userId,
        text: dto.text,
        mode: dto.mode,
        unitId: dto.unitId ?? null,
        targetTense: dto.targetTense ?? null,
        score: analysis.score,
        summary: analysis.summary,
        correctedText: analysis.correctedText,
        detectedTenses: analysis.detectedTenses,
        errors,
        wordCount: wordCount(dto.text),
        model,
      }),
    );

    return {
      id: saved.id,
      score: saved.score,
      summary: saved.summary,
      correctedText: saved.correctedText,
      detectedTenses: saved.detectedTenses as AnalysisResponse["detectedTenses"],
      errors: saved.errors,
      wordCount: saved.wordCount,
      model: saved.model,
      createdAt: saved.createdAt.toISOString(),
    };
  }

  private async callAi(dto: CreateAnalysisDto) {
    try {
      return await this.ai.analyzeText(dto.text, dto.mode, dto.targetTense);
    } catch (error) {
      this.logger.error("Analysis AI call failed", error instanceof Error ? error.stack : error);
      throw new HttpException(
        "No se pudo generar el análisis en este momento. Intentá de nuevo en un rato.",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private enforceRateLimit(userId: string): void {
    const now = Date.now();
    const timestamps = (this.requestLog.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (timestamps.length >= ANALYSIS_RATE_LIMIT_PER_MINUTE) {
      throw new HttpException("Demasiados análisis seguidos. Esperá un momento.", HttpStatus.TOO_MANY_REQUESTS);
    }
    timestamps.push(now);
    this.requestLog.set(userId, timestamps);
  }
}
