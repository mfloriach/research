import pino from "pino";
import { config } from "@/lib/config";

const isProduction = config.isProduction;

const level = config.logLevel;

export const logger = pino({
  level,
  base: {
    service: config.otelServiceName,
    env: config.nodeEnv,
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
