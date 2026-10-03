import { defineConfig } from "next-openapi-gen";

export default defineConfig({
  openapi: "3.0.0",
  info: {
    title: "Epistimology API",
    version: "1.0.0",
    description:
      "Reporting and argument-audit API: debates, full-text content, full-text search logging, and audit items (contraarguments, fallacies, evidences, sources, interpretations).",
  },
  apiDir: "./app/api",
  routerType: "app",
  schemaDir: ["./app/api", "./lib"],
  schemaType: ["zod", "typescript"],
  outputDir: "./docs/static/openapi",
  outputFile: "openapi.yaml",
  includeOpenApiRoutes: false,
  ignoreRoutes: [],
  excludeSchemas: [
    "auditItemSchema",
    "publicSchema",
    "serverSchema",
    "logLevelSchema",
    "llmProviderSchema",
    "nodeEnvSchema",
  ],
  debug: false,
});
