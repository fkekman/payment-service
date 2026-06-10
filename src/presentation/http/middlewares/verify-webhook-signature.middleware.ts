import type { Request, Response, NextFunction } from "express";
import crypto from 'node:crypto';
import { WEBHOOK_SECRET } from "../server.config";
import { InvalidWebhookSignatureError } from "../errors";

export function verifyWebhookSignature() {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['x-signature'] as string;
    if (!signature) {
      return next(new InvalidWebhookSignatureError());
    }
    const computedHash = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'utf-8'),
      Buffer.from(computedHash, 'utf-8')
    );

    if (!isValid) {
      return next(new InvalidWebhookSignatureError())
    }
    next();
  }
}
