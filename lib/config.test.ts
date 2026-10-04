/**
 * @jest-environment node
 */
import { config, getServerConfig, publicSchema, serverSchema } from "./config";

const validServerEnv = {
  mongoUri: "mongodb://localhost:27017/epistimology",
  mongoDb: "epistimology",
  ipfsRpcUrl: "http://127.0.0.1:5001",
  openaiApiKey: "test-key",
  openaiModel: "gpt-4o-mini",
  llmProvider: "openai",
  jwtSecret: "test-jwt-secret-at-least-32-chars-long",
  otelEnabled: "true",
  otelExporterOtlpEndpoint: "",
  appVersion: "0.1.0",
};

describe("config", () => {
  it("exposes typed public values with local defaults", () => {
    expect(typeof config.ipfsGatewayUrl).toBe("string");
    expect(typeof config.anvilRpcUrl).toBe("string");
    expect(typeof config.attestationContractAddress).toBe("string");
    expect(typeof config.otelServiceName).toBe("string");
    expect(["development", "test", "production"]).toContain(config.nodeEnv);
    expect(["debug", "info", "warn", "error"]).toContain(config.logLevel);
    expect(typeof config.isProduction).toBe("boolean");
    expect(config.isDevelopment).toBe(!config.isProduction);
  });

  it("accepts a valid server environment", () => {
    const parsed = serverSchema.parse(validServerEnv);
    expect(parsed.mongoUri).toBe("mongodb://localhost:27017/epistimology");
    expect(parsed.otelEnabled).toBe(true);
  });

  it("rejects a missing MONGODB_URI", () => {
    expect(() =>
      serverSchema.parse({ ...validServerEnv, mongoUri: undefined }),
    ).toThrow("MONGODB_URI");
  });

  it("rejects a missing OPENAI_API_KEY", () => {
    expect(() =>
      serverSchema.parse({ ...validServerEnv, openaiApiKey: undefined }),
    ).toThrow("OPENAI_API_KEY");
  });

  it("rejects a missing or short JWT_SECRET", () => {
    expect(() =>
      serverSchema.parse({ ...validServerEnv, jwtSecret: undefined }),
    ).toThrow("JWT_SECRET");
    expect(() =>
      serverSchema.parse({ ...validServerEnv, jwtSecret: "too-short" }),
    ).toThrow("JWT_SECRET");
  });

  it("rejects malformed URLs and providers", () => {
    expect(() =>
      serverSchema.parse({ ...validServerEnv, mongoUri: "not a url" }),
    ).toThrow("MONGODB_URI");
    expect(() =>
      serverSchema.parse({ ...validServerEnv, llmProvider: "other" }),
    ).toThrow();
    expect(() =>
      serverSchema.parse({ ...validServerEnv, otelEnabled: "yes" }),
    ).toThrow();
  });

  it("rejects a malformed attestation contract address", () => {
    expect(() =>
      publicSchema.parse({
        nodeEnv: "test",
        ipfsGatewayUrl: "http://127.0.0.1:8080",
        anvilRpcUrl: "http://127.0.0.1:8545",
        attestationContractAddress: "0x123",
        otelServiceName: "epistimology-app",
      }),
    ).toThrow("NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS");
  });

  it("returns a cached server config", () => {
    expect(getServerConfig()).toBe(getServerConfig());
    expect(typeof getServerConfig().mongoDb).toBe("string");
  });
});
