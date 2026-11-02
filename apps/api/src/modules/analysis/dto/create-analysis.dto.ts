import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { ANALYSIS_MODES, MAX_ANALYSIS_TEXT_LENGTH, type AnalysisMode } from "@tense-lab/shared";
import { TENSES, type Tense } from "@tense-lab/shared";

export class CreateAnalysisDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_ANALYSIS_TEXT_LENGTH)
  text: string;

  @IsIn(ANALYSIS_MODES)
  mode: AnalysisMode;

  @IsOptional()
  @IsIn(TENSES)
  unitId?: Tense;

  @IsOptional()
  @IsIn(TENSES)
  targetTense?: Tense;
}
