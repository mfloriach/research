import { z } from "zod";
import {BadRequestError} from "@/lib/errors"

export async function parseJson<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new BadRequestError("Invalid JSON body");
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    throw new BadRequestError(
      result.error.issues[0]?.message ?? "Invalid request body",
    );
  }

  return result.data;
}

/**
 * Validate URL query params against a Zod schema (for GET routes, which
 * carry no body). Only present params are passed, so optional fields fall
 * back to their defaults. Throws BadRequestError like parseJson.
 */
export function parseQueryParams<T>(
  request: Request,
  schema: z.ZodType<T>,
): T {
  const { searchParams } = new URL(request.url);
  const query: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const result = schema.safeParse(query);

  if (!result.success) {
    throw new BadRequestError(
      result.error.issues[0]?.message ?? "Invalid query",
    );
  }

  return result.data;
}
