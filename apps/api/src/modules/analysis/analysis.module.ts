import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AiModule } from "../../common/ai/ai.module";
import { AnalysisController } from "./analysis.controller";
import { AnalysisService } from "./analysis.service";
import { AnalysisAiService } from "./analysis-ai.service";
import { Analysis } from "./entities/analysis.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Analysis]), AiModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisAiService],
})
export class AnalysisModule {}
