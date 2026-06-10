import { ApplicationError } from "@usecase/errors";

export class RequestValidationError extends ApplicationError {
  statusCode: number = 400;
  constructor(fields: Record<string, string[]>) {
    super(JSON.stringify(fields));
  }
}

export class InvalidWebhookSignatureError extends ApplicationError {
  statusCode: number = 401;
  constructor(msg: string = 'Invalid webhook signature') {
    super(msg);
  }
}

export class InvalidNonceTokenError extends ApplicationError {
  statusCode: number = 401;
  constructor(msg: string = 'Invalid nonce token') {
    super(msg);
  }
}

