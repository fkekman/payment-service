import express from 'express';
import type { Express } from 'express';

import type { PaymentController } from './controllers/payment.controller';
import { createPaymentRouter } from './routes/payment.routes';
import { PORT } from './server.config';
import { client as redisClient } from '@infra/redis/client';
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware';

export class ExpressServer {
  private expressApp: Express;

  constructor(
    paymentController: PaymentController,
  ) {
    this.expressApp = express();

    const paymentRouter = createPaymentRouter(
      paymentController,
      redisClient,
    );

    this.expressApp.use(express.json());
    this.expressApp.use('/invoice', paymentRouter);
    this.expressApp.use(errorHandlerMiddleware());
  }

  run() {
    const { resolve, reject, promise } = Promise.withResolvers<void>();

    const serverInstance = this.expressApp.listen(PORT, () => {
      resolve();
    });

    serverInstance.on('error', (err) => {
      reject(err);
    });

    return promise;
  }
}

