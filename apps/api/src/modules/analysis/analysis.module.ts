import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalysisController } from "./analysis.controller";
import { AnalysisService } from "./analysis.service";
import { AnthropicService } from "./anthropic.service";
import { Analysis } from "./entities/analysis.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Analysis])],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnthropicService],
})
export class AnalysisModule {}
