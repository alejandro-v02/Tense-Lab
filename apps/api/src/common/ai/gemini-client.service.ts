import { Injectable } from "@nestjs/common";
import { FunctionCallingConfigMode, GoogleGenAI } from "@google/genai";

export interface ToolCallParams {
  model: string;
  system: string;
  userContent: string;
  tool: { name: string; description: string; parametersJsonSchema: Record<string, unknown> };
}

@Injectable()
export class GeminiClientService {
  private readonly client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  modelFor(size: "small" | "large"): string {
    const small = process.env.AI_MODEL_SMALL ?? "gemini-2.0-flash";
    const large = process.env.AI_MODEL_LARGE ?? "gemini-2.0-flash";
    return size === "small" ? small : large;
  }

  /** Forces a function call so the response is structured JSON rather than free text. */
  async callTool(params: ToolCallParams): Promise<unknown> {
    const response = await this.client.models.generateContent({
      model: params.model,
      contents: params.userContent,
      config: {
        systemInstruction: params.system,
        tools: [
          {
            functionDeclarations: [
              {
                name: params.tool.name,
                description: params.tool.description,
                parametersJsonSchema: params.tool.parametersJsonSchema,
              },
            ],
          },
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
            allowedFunctionNames: [params.tool.name],
          },
        },
      },
    });

    return response.functionCalls?.[0]?.args ?? null;
  }
}
