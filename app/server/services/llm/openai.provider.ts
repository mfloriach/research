import OpenAI from "openai";
import { AppError } from "@/lib/errors";
import { getServerConfig } from "@/lib/config";
import type { LlmAnswer, LlmAnswerInput, LlmProvider } from "./types";

export class OpenAiProvider implements LlmProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    const server = getServerConfig();
    this.client = new OpenAI({ apiKey: server.openaiApiKey });
    this.model = server.openaiModel;
  }

  async generateAnswer(input: LlmAnswerInput): Promise<LlmAnswer> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: input.query }],
      });
      const answer = completion.choices[0]?.message?.content?.trim() ?? "";

      return { answer, model: completion.model ?? this.model };
    } catch (error) {
      console.error("OpenAI request failed:", error);
      throw new AppError(500, "LLM request failed");
    }
  }
}
