import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import type { BuildableSentence } from "@tense-lab/shared";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser, type AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { PracticeService } from "./practice.service";
import { GenerateSentenceDto } from "./dto/generate-sentence.dto";

@Controller("practice")
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(private readonly practice: PracticeService) {}

  @Post("units/:id/sentences/generate")
  generate(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") unitId: string,
    @Body() dto: GenerateSentenceDto,
  ): Promise<BuildableSentence> {
    return this.practice.generateSentence(user.userId, unitId, dto.avoid ?? []);
  }
}
