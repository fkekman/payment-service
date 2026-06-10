import type { PaymentEntity } from "@domain/payment/payment.entity";
import type { IPaymentRepository } from "@domain/payment/payment.repository";
import { NotFoundError } from "./errors";

export class GetPaymentUseCase {
  constructor(
    private paymentRepository: IPaymentRepository
  ) { }
  async execute(paymentId: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }
    return payment;
  }
}
