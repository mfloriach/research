import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getRequestLogger } from "@/lib/logger";
import { AppError, HttpResponse } from "@/lib/errors";
import { getServerConfig } from "@/lib/config";
import { AUTH_COOKIE_NAME } from "@/lib/siwe";

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

/**
 * Resolve the SIWE session address without ever failing the request.
 * Any misconfiguration or invalid token resolves to `null`.
 */
async function resolveSessionAddress(
  request: NextRequest,
): Promise<string | null> {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return null;
    }
    const secret = new TextEncoder().encode(getServerConfig().jwtSecret);
    const { payload } = await jwtVerify(token, secret, {
      issuer: "epistimology",
    });
    return typeof payload.address === "string" ? payload.address : null;
  } catch {
    return null;
  }
}

/**
 * Audit creators (POST /api/audits/<tab>) require a JWT session; every
 * other route stays public, including view-count open posts. Matches
 * the collection level only (3 path segments), never deeper routes.
 */
function requiresSession(pathname: string, method: string): boolean {
  if (method !== "POST") {
    return false;
  }
  const segments = pathname.split("/").filter((part) => part !== "");
  return (
    segments.length === 3 && segments[0] === "api" && segments[1] === "audits"
  );
}

export async function middleware(request: NextRequest) {
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
    const sessionAddress = await resolveSessionAddress(request);
    if (requiresSession(route, method) && !sessionAddress) {
      log.warn(
        {
          event: "request.unauthorized",
          path: url.pathname,
          ip,
          userAgent,
        },
        `${method} ${url.pathname} 401 (authentication required)`,
      );
      const denied = NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
      denied.headers.set("x-request-id", requestId);
      return denied;
    }
    const requestHeaders = new Headers(request.headers);
    if (sessionAddress) {
      requestHeaders.set("x-auth-address", sessionAddress);
    }
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

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
