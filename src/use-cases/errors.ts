export abstract class ApplicationError extends Error {
  abstract readonly statusCode: number;
}

export class BadRequestError extends ApplicationError {
  statusCode: number = 400;
}

export class NotFoundError extends ApplicationError {
  statusCode: number = 404;
}

export class PaymentStateConflict extends ApplicationError {
  statusCode: number = 409;
}
