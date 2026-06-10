import timers from 'node:timers/promises';

import { describe, it, beforeEach, vi } from 'vitest';
import { ProcessWebhookUseCase, type ProcessWebhookInput } from './process-webhook.use-case';
import { PaymentEntity } from '../domain/payment/payment.entity';
import { client } from '../infrastructure/mongodb/client';
import { MongoPaymentRepository } from '../infrastructure/mongodb/mongo-payment.repository';

describe('ProcessWebhookUseCase - Race Condition with Mocked Delay', () => {
  let paymentRepository: MongoPaymentRepository;
  let useCase: ProcessWebhookUseCase;

  beforeEach(() => {
    paymentRepository = new MongoPaymentRepository(client.db('payment_platform'));
    useCase = new ProcessWebhookUseCase(paymentRepository);
  });

  it('должен поймать конфликт статуса, если один из запросов выполнялся дольше', async () => {
    const paymentId = 'payment-race-mock';
    const payment = PaymentEntity.load({
      id: paymentId, status: 'PENDING', amountCents: '5000',
      currency: 'RUB',
      merchantId: 'sos',
      feePercent: '0.1',
      feeCents: '500',
      amountToReceiveCents: '4500',
      createdAt: new Date()
    });

    await paymentRepository.save(payment);

    const originalUpdate = paymentRepository.updateWithStatusCheck.bind(paymentRepository);

    vi.spyOn(paymentRepository, 'updateWithStatusCheck').mockImplementation(async (entity: PaymentEntity, expectedStatus) => {
      await timers.setTimeout(1000);
      return await originalUpdate(entity, expectedStatus);
    });

    const payload: ProcessWebhookInput = { invoiceId: paymentId, status: 'paid' };

    await Promise.allSettled([
      useCase.execute(payload),
      useCase.execute(payload)
    ]);
    vi.restoreAllMocks();
  });
});
