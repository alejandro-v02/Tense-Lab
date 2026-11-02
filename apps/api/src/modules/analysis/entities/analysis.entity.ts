import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import type { AnalysisMode } from "@tense-lab/shared";
import type { AiError } from "@tense-lab/shared";

export interface StoredPositionedError extends AiError {
  id: string;
  start: number;
  end: number;
  relativePosition: number;
  resolved: boolean;
  createdAt: string;
}

@Entity("analyses")
export class Analysis {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column("text")
  text: string;

  @Column()
  mode: AnalysisMode;

  @Column({ type: "varchar", nullable: true })
  unitId: string | null;

  @Column({ type: "varchar", nullable: true })
  targetTense: string | null;

  @Column("int")
  score: number;

  @Column("text")
  summary: string;

  @Column("text")
  correctedText: string;

  @Column("jsonb")
  detectedTenses: string[];

  @Column("jsonb")
  errors: StoredPositionedError[];

  @Column("int")
  wordCount: number;

  @Column()
  model: string;

  @CreateDateColumn()
  createdAt: Date;
}
