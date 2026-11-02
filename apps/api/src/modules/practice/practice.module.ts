import { Module } from "@nestjs/common";
import { AiModule } from "../../common/ai/ai.module";
import { ContentModule } from "../content/content.module";
import { PracticeController } from "./practice.controller";
import { PracticeService } from "./practice.service";
import { SentenceGeneratorService } from "./sentence-generator.service";

@Module({
  imports: [ContentModule, AiModule],
  controllers: [PracticeController],
  providers: [PracticeService, SentenceGeneratorService],
})
export class PracticeModule {}
