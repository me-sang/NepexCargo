export class AppException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly errors?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundException extends AppException {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class BadRequestException extends AppException {
  constructor(message = 'Bad request', errors?: unknown) {
    super(message, 400, errors);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenException extends AppException {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictException extends AppException {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class UnprocessableEntityException extends AppException {
  constructor(message = 'Unprocessable entity', errors?: unknown) {
    super(message, 422, errors);
  }
}
