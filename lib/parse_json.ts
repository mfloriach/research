import { z } from "zod";

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

class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

class BadRequestError extends HttpError {
  constructor(message: string) {
    super(message, 400);
  }
}

class NotFoundError extends HttpError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}
