import OpenAI from "openai";
import { AppError } from "@/lib/errors";
import type { LlmAnswer, LlmAnswerInput, LlmProvider } from "./types";

export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

export class OpenAiProvider implements LlmProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    apiKey: string = process.env.OPENAI_API_KEY ?? "",
    model: string = process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
  ) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
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
