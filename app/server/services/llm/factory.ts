import { OpenAiProvider } from "./openai.provider";
import { getServerConfig } from "@/lib/config";
import type { LlmProvider } from "./types";

export function getLlmProvider(name?: string): LlmProvider {
  const provider = name ?? getServerConfig().llmProvider;
  switch (provider) {
    case "openai":
      return new OpenAiProvider();
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}
