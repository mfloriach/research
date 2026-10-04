export class HttpResponse extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends HttpResponse {
  constructor(message = "Resource not found") {
    super(404, message);
    this.name = "ResourceNotFound";
  }
}

export class BadRequestError extends HttpResponse {
  constructor(message = "Bad request") {
    super(400, message);
    this.name = "BadRequest";
  }
}

export class UnauthorizedError extends HttpResponse {
  constructor(message = "Unauthorized") {
    super(401, message);
    this.name = "Unauthorized";
  }
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class IpfsUnavailableError extends AppError {
  constructor(message = "IPFS unavailable") {
    super(500, message);
    this.name = "IpfsUnavailableError";
  }
}
