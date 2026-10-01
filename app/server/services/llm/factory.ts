import { OpenAiProvider } from "./openai.provider";
import type { LlmProvider } from "./types";

export function getLlmProvider(name: string = process.env.LLM_PROVIDER ?? "openai"): LlmProvider {
  switch (name) {
    case "openai":
      return new OpenAiProvider();
    default:
      throw new Error(`Unknown LLM provider: ${name}`);
  }
}
