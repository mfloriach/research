import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRequestLogger } from "@/lib/logger";
import { AppError, HttpResponse, IpfsUnavailableError } from "@/lib/errors";

export function getRequestId(request: Request): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function middleware(request: NextRequest) {
  const start = performance.now();
  const requestId = getRequestId(request);
  const method = request.method;
  const url = new URL(request.url);
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const route = request.nextUrl.pathname;

  const log = getRequestLogger({
    requestId,
    route,
    method,
  });

  try {
    const response = NextResponse.next();

    const durationMs = Math.round(performance.now() - start);
    const status = response.status;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

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
    // if (error instanceof AuditItemNotFoundError) {
    //     return NextResponse.json({ error: "Audit item not found" }, { status: 404 });
    // }
    // log.error(
    //     { event: "audit.openFailed", err: error },
    //     "Failed to record contraargument open",
    // );

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

    if (error instanceof HttpResponse) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Could not record open" },
      { status: 500 },
    );
  }
}
