import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import type { AnalysisResponse } from "@tense-lab/shared";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser, type AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { AnalysisService } from "./analysis.service";
import { CreateAnalysisDto } from "./dto/create-analysis.dto";

@Controller("analysis")
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(private readonly analysis: AnalysisService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAnalysisDto): Promise<AnalysisResponse> {
    return this.analysis.analyze(user.userId, dto);
  }
}
