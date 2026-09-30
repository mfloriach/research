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
