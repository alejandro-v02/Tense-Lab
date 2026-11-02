import { Controller, Get, Param } from "@nestjs/common";
import type { Unit } from "@tense-lab/shared";
import { ContentService } from "./content.service";

@Controller("content")
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get("units")
  getUnits(): Unit[] {
    return this.content.getUnits();
  }

  @Get("units/:id")
  getUnit(@Param("id") id: string): Unit {
    return this.content.getUnit(id);
  }
}
