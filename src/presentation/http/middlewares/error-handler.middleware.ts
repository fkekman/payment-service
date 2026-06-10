import { DomainError } from "@domain/shared/errors/domain.error";
import { ApplicationError } from "@usecase/errors";
import type { Request, Response, NextFunction } from "express";

export function errorHandlerMiddleware() {
  return (error: Error, request: Request, response: Response, next: NextFunction) => {

    if (error instanceof ApplicationError) {
      return response
        .status(error.statusCode)
        .json({
          status: 'error',
          statusCode: error.statusCode,
          message: error.message,
        });
    }

    if (error instanceof DomainError) {
      console.error('WARN: UNHANDLED DOMAIN ERROR');
    }
    console.error(error);

    return response
      .status(500)
      .json({
        status: 'error',
        statusCode: 500,
        message: 'Internal server error'
      });
  }
}
