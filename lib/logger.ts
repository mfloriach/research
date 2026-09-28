import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const level = process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug");

export const logger = pino({
  level,
  base: {
    service: process.env.OTEL_SERVICE_NAME ?? "epistimology-app",
    env: process.env.NODE_ENV ?? "development",
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.headers.authorization",
      "*.headers.cookie",
    ],
    censor: "[Redacted]",
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
            singleLine: false,
          },
        },
      }),
});

export type RequestLogContext = {
  requestId: string;
  route: string;
  method: string;
};

export function getRequestLogger(ctx: RequestLogContext) {
  return logger.child(ctx);
}
