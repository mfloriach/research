export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, message);
    this.name = "ResourceNotFound";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(400, message);
    this.name = "BadRequest";
  }
}

export class IpfsUnavailableError extends AppError {
  constructor(message = "IPFS unavailable") {
    super(500, message);
    this.name = "IpfsUnavailableError";
  }
}
