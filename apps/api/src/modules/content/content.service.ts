import { Injectable, NotFoundException, type OnModuleInit } from "@nestjs/common";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Unit, VocabWord } from "@tense-lab/shared";

@Injectable()
export class ContentService implements OnModuleInit {
  private units: Unit[] = [];
  private vocabulary: VocabWord[] = [];

  onModuleInit(): void {
    // apps/api/src/modules/content -> repo root is 5 levels up; dist mirrors
    // this same relative depth, so the path holds in both dev and prod.
    const dataDir = process.env.CONTENT_DIR ?? join(__dirname, "../../../../../data");

    this.units = JSON.parse(readFileSync(join(dataDir, "units.json"), "utf-8"));

    const fullVocabPath = join(dataDir, "vocabulary.json");
    const vocabPath = existsSync(fullVocabPath) ? fullVocabPath : join(dataDir, "vocabulary.sample.json");
    this.vocabulary = JSON.parse(readFileSync(vocabPath, "utf-8"));
  }

  getUnits(): Unit[] {
    return this.units;
  }

  getUnit(id: string): Unit {
    const unit = this.units.find((u) => u.id === id);
    if (!unit) {
      throw new NotFoundException(`Unit "${id}" not found`);
    }
    return unit;
  }

  getVocabularyForUnit(unitId: string): VocabWord[] {
    return this.vocabulary.filter((w) => w.unitId === unitId);
  }

  getAllVocabulary(): VocabWord[] {
    return this.vocabulary;
  }
}
