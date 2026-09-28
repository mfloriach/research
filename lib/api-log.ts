import { randomUUID } from "node:crypto";
import { getRequestLogger } from "@/lib/logger";

export function getRequestId(request: Request): string {
  return request.headers.get("x-request-id") ?? randomUUID();
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

type RouteContext<
  TParams extends Record<string, string> = Record<string, string>,
> = {
  params: Promise<TParams>;
};

type RouteHandler<
  TParams extends Record<string, string> = Record<string, string>,
> = (
  request: Request,
  context: RouteContext<TParams>,
  log: ReturnType<typeof getRequestLogger>,
) => Promise<Response>;

/**
 * Wraps an API route handler with access logging:
 * method, route, status, duration, requestId, IP, user-agent.
 */
export function withRouteLogging<
  TParams extends Record<string, string> = Record<string, string>,
>(
  route: string,
  handler: RouteHandler<TParams>,
) {
  return async (
    request: Request,
    context: RouteContext<TParams>,
  ): Promise<Response> => {
    const start = performance.now();
    const requestId = getRequestId(request);
    const method = request.method;
    const url = new URL(request.url);
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const log = getRequestLogger({
      requestId,
      route,
      method,
    });

    log.info(
      {
        event: "request.start",
        path: url.pathname,
        query: Object.fromEntries(url.searchParams.entries()),
        ip,
        userAgent,
      },
      `${method} ${url.pathname} started`,
    );

    try {
      const response = await handler(request, context, log);

      const durationMs = Math.round(performance.now() - start);
      const status = response.status;
      const level =
        status >= 500
          ? "error"
          : status >= 400
            ? "warn"
            : "info";

      log[level](
        {
          event: "request.complete",
          path: url.pathname,
          status,
          durationMs,
          ip,
          userAgent,
        },
        `${method} ${url.pathname} ${status} in ${durationMs}ms`,
      );

      response.headers.set("x-request-id", requestId);

      return response;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);

      log.error(
        {
          event: "request.error",
          path: url.pathname,
          durationMs,
          ip,
          userAgent,
          err: error,
        },
        `${method} ${url.pathname} failed in ${durationMs}ms`,
      );

      throw error;
    }
  };
}