import { config as loadLocalEnv } from "dotenv";
import OpenAI from "openai";

// dotenv does not load .env.local by default.
loadLocalEnv({ path: ".env.local" });

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey || apiKey.startsWith("sk-") === false) {
  console.error("OPENAI_API_KEY is not set or malformed. Add it to .env.local first.");
  process.exit(1);
}

const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const query =
  process.argv.slice(2).join(" ").trim() ||
  "Explain what a carbon border adjustment mechanism is in one sentence.";

const client = new OpenAI({ apiKey });

async function main() {
  console.error(`[query] ${query}\n[model] ${model}\n`);
  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: query }],
    });
  } catch (error: any) {
    const status = error?.status;
    const type = error?.code || error?.error?.type;
    console.error(`[error] Request failed (status=${status ?? "none"}): ${error?.message}`);
    if (status === 429) {
      console.error("[hint] Your API key has no credits. Top up at https://platform.openai.com/settings/organization/billing/");
    } else if (status === 401) {
      console.error("[hint] OPENAI_API_KEY is invalid. Regenerate it.");
    } else if (status === 404 || /model/i.test(String(error?.message || ""))) {
      console.error(`[hint] Model "${model}" may not exist. Try OPENAI_MODEL=gpt-4o-mini.`);
    }
    process.exit(1);
  }
  const answer = completion.choices[0]?.message?.content?.trim() ?? "";
  console.log(answer);
}

main().catch((error) => {
  console.error("[error]", error instanceof Error ? error.message : error);
  process.exit(1);
});
