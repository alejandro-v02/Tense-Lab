import { ArrayMaxSize, IsArray, IsOptional, IsString } from "class-validator";
import { MAX_AVOID_SENTENCES } from "@tense-lab/shared";

export class GenerateSentenceDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_AVOID_SENTENCES)
  @IsString({ each: true })
  avoid?: string[];
}
