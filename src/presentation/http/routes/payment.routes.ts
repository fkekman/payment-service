import { Router } from "express";
import type { PaymentController } from "../controllers/payment.controller";
import { verifyWebhookSignature } from "../middlewares/verify-webhook-signature.middleware";
import { verifyNonce } from "../middlewares/verify-nonce.middleware";

export function createPaymentRouter(
  paymentController: PaymentController,
  redisClient: any,
) {
  const router = Router();

  router.get('/:id', paymentController.handleGetPayment.bind(paymentController));
  router.post('', paymentController.handleCreatePayment.bind(paymentController));
  router.post('/webhook',
    verifyWebhookSignature(),
    verifyNonce(redisClient),
    paymentController.handleProcessWebhook.bind(paymentController));

  return router;
}
