import { describe, it, expect, beforeEach, vi, type Mocked } from 'vitest';
import { CreatePaymentUseCase, type CreatePaymentInput } from './create-payment.use-case';
import { PaymentEntity } from '@domain/payment/payment.entity';
import { PaymentStatus } from '@domain/payment/payment.types';
import type { IPaymentRepository } from '@domain/payment/payment.repository';
import type { IPaymentGateway } from '@domain/payment/payment.gateway';

describe('CreatePaymentUseCase', () => {
  let mockRepository: Mocked<IPaymentRepository>;
  let mockGateway: Mocked<IPaymentGateway>;
  let useCase: CreatePaymentUseCase;

  const inputData: CreatePaymentInput = {
    amountCents: 10000, // 100 рублей
    currency: 'RUB',
    merchantId: 'merchant-uuid-123',
  };

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    } as unknown as Mocked<IPaymentRepository>;

    mockGateway = {
      getPaymentFee: vi.fn(),
      initiatePayment: vi.fn(),
    } as unknown as Mocked<IPaymentGateway>;

    useCase = new CreatePaymentUseCase(mockRepository, mockGateway);
  });

  it('должен успешно создать черновик, инициировать платеж в шлюзе и перевести в PENDING', async () => {
    mockGateway.getPaymentFee.mockReturnValue(0.035);
    mockRepository.save.mockImplementation(async (payment) => payment);
    mockRepository.update.mockImplementation(async (payment) => payment);

    const expectedExternalId = 'ext-tx-999';
    mockGateway.initiatePayment.mockResolvedValue(expectedExternalId);

    const resultPayment = await useCase.execute(inputData);

    expect(mockGateway.getPaymentFee).toHaveBeenCalledTimes(1);
    expect(mockGateway.initiatePayment).toHaveBeenCalledWith(
      expect.any(PaymentEntity)
    );

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.update).toHaveBeenCalledTimes(1);

    expect(resultPayment.status).toBe(PaymentStatus.PENDING);
    expect(resultPayment.externalId).toBe(expectedExternalId);
    expect(resultPayment.currency).toBe(inputData.currency);
    expect(resultPayment.merchantId).toBe(inputData.merchantId);

    expect(resultPayment.feeCents.toString()).toBe('350');
    expect(resultPayment.amountToReceiveCents.toString()).toBe('9650');
  });

  it('должен перевести платеж в FAIL и обновить в базе, если внешняя платежка упала с ошибкой', async () => {

    mockGateway.getPaymentFee.mockReturnValue(0.02);
    mockRepository.save.mockImplementation(async (payment) => payment);
    mockRepository.update.mockImplementation(async (payment) => payment);

    mockGateway.initiatePayment.mockRejectedValue(new Error('Gateway timeout or connection refuse'));

    await expect(useCase.execute(inputData)).rejects.toThrow('Gateway timeout or connection refuse');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.update).toHaveBeenCalledTimes(1);
  });
});
