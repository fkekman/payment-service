import type { Request, Response, NextFunction } from "express";
import { InvalidNonceTokenError } from "../errors";

export function verifyNonce(redisClient: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nonce = req.headers['x-nonce'] || req.body?.nonce;
      if (!nonce || typeof nonce !== 'string') {
        throw new InvalidNonceTokenError();
      }
      const lockKey = `nonce:${nonce}`;
      const isSet = await redisClient.set(lockKey, 'true', 'EX', 600, 'NX');

      if (!isSet) {
        throw new InvalidNonceTokenError();
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
