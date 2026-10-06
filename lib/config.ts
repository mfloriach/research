import { z } from "zod";

/**
 * Centralized environment configuration. This module is the ONLY place
 * allowed to read `process.env` (enforced by ESLint).
 *
 * - `config`: public values, parsed eagerly at import. Safe to import from
 *   client components. Missing values fall back to local defaults and
 *   malformed values throw immediately.
 * - `getServerConfig()`: secrets and server-only values. Throws when a
 *   required secret is missing or any value is malformed. Call it at module
 *   scope of server-only modules so misconfiguration fails fast (including
 *   during `next build`). NEVER import it from client components: secrets
 *   are not inlined into browser bundles and validation would throw there.
 */

const nodeEnvSchema = z.enum(["development", "test", "production"]);

const logLevelSchema = z.enum(["debug", "info", "warn", "error"]);

const llmProviderSchema = z.enum(["openai"]);

function urlSchema(label: string, fallback: string) {
  return z
    .string()
    .default(fallback)
    .refine(
      (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      { message: `${label} must be a valid URL` },
    );
}

const addressSchema = (label: string) =>
  z
    .string()
    .default("")
    .refine((value) => value === "" || /^0x[0-9a-fA-F]{40}$/.test(value), {
      message: `${label} must be a 0x-prefixed 40-hex-char address`,
    });

export const publicSchema = z.object({
  nodeEnv: nodeEnvSchema.default("development"),
  ipfsGatewayUrl: urlSchema(
    "NEXT_PUBLIC_IPFS_GATEWAY_URL",
    "http://127.0.0.1:8080",
  ).transform((value) => value.replace(/\/$/, "")),
  anvilRpcUrl: urlSchema("NEXT_PUBLIC_ANVIL_RPC_URL", "http://127.0.0.1:8545"),
  attestationContractAddress: addressSchema(
    "NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS",
  ),
  otelServiceName: z.string().default("epistimology-app"),
});

export const serverSchema = z.object({
  mongoUri: z
    .string({ error: "MONGODB_URI is required" })
    .min(
      1,
      "MONGODB_URI is not set. Copy .env.example to .env.local and start MongoDB with `docker compose up -d`.",
    )
    .refine(
      (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      { message: "MONGODB_URI must be a valid URL" },
    ),
  mongoDb: z.string().default("epistimology"),
  ipfsRpcUrl: urlSchema("IPFS_RPC_URL", "http://127.0.0.1:5001"),
  openaiApiKey: z
    .string({ error: "OPENAI_API_KEY is required" })
    .min(1, "OPENAI_API_KEY is not set. Copy .env.example to .env.local."),
  openaiModel: z.string().default("gpt-4o-mini"),
  llmProvider: llmProviderSchema.default("openai"),
  jwtSecret: z
    .string({ error: "JWT_SECRET is required" })
    .min(
      32,
      "JWT_SECRET must be at least 32 characters. Generate one with `openssl rand -base64 48`.",
    ),
  otelEnabled: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  otelExporterOtlpEndpoint: z.string().default(""),
  appVersion: z.string().default("0.1.0"),
});

export type PublicConfig = z.infer<typeof publicSchema>;
export type ServerConfig = z.infer<typeof serverSchema>;

function readPublicEnv(): PublicConfig {
  return publicSchema.parse({
    nodeEnv: process.env.NODE_ENV,
    ipfsGatewayUrl: process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL?.trim(),
    anvilRpcUrl: process.env.NEXT_PUBLIC_ANVIL_RPC_URL?.trim(),
    attestationContractAddress:
      process.env.NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS?.trim(),
    otelServiceName: process.env.OTEL_SERVICE_NAME,
  });
}

function readServerEnv(): ServerConfig {
  return serverSchema.parse({
    mongoUri: process.env.MONGODB_URI,
    mongoDb: process.env.MONGODB_DB,
    ipfsRpcUrl: process.env.IPFS_RPC_URL?.trim(),
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL,
    llmProvider: process.env.LLM_PROVIDER,
    jwtSecret: process.env.JWT_SECRET,
    otelEnabled: process.env.OTEL_ENABLED,
    otelExporterOtlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    appVersion: process.env.npm_package_version,
  });
}

export type AppConfig = PublicConfig & {
  isProduction: boolean;
  isDevelopment: boolean;
  logLevel: z.infer<typeof logLevelSchema>;
};

export const config: AppConfig = (() => {
  const parsed = readPublicEnv();
  const isProduction = parsed.nodeEnv === "production";
  const rawLogLevel = process.env.LOG_LEVEL;
  return {
    ...parsed,
    isProduction,
    isDevelopment: !isProduction,
    logLevel:
      rawLogLevel === undefined
        ? isProduction
          ? "info"
          : "debug"
        : logLevelSchema.parse(rawLogLevel),
  };
})();

let cachedServerConfig: ServerConfig | null = null;

export function getServerConfig(): ServerConfig {
  if (!cachedServerConfig) {
    cachedServerConfig = readServerEnv();
  }
  return cachedServerConfig;
}
