import { OpenAiProvider } from "./openai.provider";
import { getServerConfig } from "@/lib/config";
import type { LlmProvider } from "./types";

const providers: Record<string, LlmProvider> = {
  openai: new OpenAiProvider(),
};

export function getLlmProvider(name?: string): LlmProvider {
  const provider = name ?? getServerConfig().llmProvider;
  return providers[provider];
}
