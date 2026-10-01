import { config, getServerConfig } from "@/lib/config";

export async function register() {
  // NEXT_RUNTIME is provided by Next.js itself, not .env: keep the direct
  // read as the single sanctioned exception (see eslint.config.mjs).
  // eslint-disable-next-line no-restricted-properties
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  const server = getServerConfig();
  if (!server.otelEnabled) {
    return;
  }

  const { NodeSDK } = await import("@opentelemetry/sdk-node");
  const { getNodeAutoInstrumentations } = await import(
    "@opentelemetry/auto-instrumentations-node"
  );
  const { resourceFromAttributes } = await import("@opentelemetry/resources");
  const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = await import(
    "@opentelemetry/semantic-conventions"
  );

  let traceExporter;
  if (server.otelExporterOtlpEndpoint) {
    const { OTLPTraceExporter } = await import(
      "@opentelemetry/exporter-trace-otlp-http"
    );
    traceExporter = new OTLPTraceExporter({
      url: server.otelExporterOtlpEndpoint,
    });
  }

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: config.otelServiceName,
      [ATTR_SERVICE_VERSION]: server.appVersion,
      "deployment.environment": config.nodeEnv,
    }),
    ...(traceExporter ? { traceExporter } : {}),
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
      }),
    ],
  });

  sdk.start();
}
