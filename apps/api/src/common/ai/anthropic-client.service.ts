import { Injectable } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";

export interface ToolCallParams {
  model: string;
  system: string;
  userContent: string;
  tool: { name: string; description: string; inputSchema: Anthropic.Tool.InputSchema };
  maxTokens?: number;
}

@Injectable()
export class AnthropicClientService {
  private readonly client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  modelFor(size: "small" | "large"): string {
    const small = process.env.AI_MODEL_SMALL ?? "claude-haiku-5-5";
    const large = process.env.AI_MODEL_LARGE ?? "claude-sonnet-5-5";
    return size === "small" ? small : large;
  }

  /** Forces a tool-use call so the response is structured JSON rather than free text. */
  async callTool(params: ToolCallParams): Promise<unknown> {
    const response = await this.client.messages.create({
      model: params.model,
      max_tokens: params.maxTokens ?? 2048,
      system: params.system,
      messages: [{ role: "user", content: params.userContent }],
      tools: [
        { name: params.tool.name, description: params.tool.description, input_schema: params.tool.inputSchema },
      ],
      tool_choice: { type: "tool", name: params.tool.name },
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    return toolUse?.type === "tool_use" ? toolUse.input : null;
  }
}
