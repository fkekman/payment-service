import { PaymentEntity } from "@domain/payment/payment.entity";
import type { IPaymentGateway } from "@domain/payment/payment.gateway";
import type { IPaymentRepository } from "@domain/payment/payment.repository";

export interface CreatePaymentInput {
  amountCents: number;
  currency: string;
  merchantId: string;
}

export class CreatePaymentUseCase {
  constructor(
    private paymentRepository: IPaymentRepository,
    private paymentGateway: IPaymentGateway,
  ) { }

  async execute(data: CreatePaymentInput): Promise<PaymentEntity> {

    const feePercent = this.paymentGateway.getPaymentFee();

    let payment = PaymentEntity.createDraft({
      ...data,
      feePercent,
    });

    payment = await this.paymentRepository.save(payment);

    try {
      const externalId = await this.paymentGateway.initiatePayment(payment);
      payment.toPending(externalId);
    } catch (err) {
      payment.fail();
    }

    payment = await this.paymentRepository.update(payment);

    return payment;
  }
}
