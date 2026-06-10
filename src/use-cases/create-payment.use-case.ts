import { PaymentEntity } from "@domain/payment/payment.entity";
import { PaymentValidationError } from "@domain/payment/payment.errors";
import type { IPaymentGateway } from "@domain/payment/payment.gateway";
import type { IPaymentRepository } from "@domain/payment/payment.repository";
import { BadRequestError } from "./errors";

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

    let payment;
    try {
      payment = PaymentEntity.createDraft({
        ...data,
        feePercent,
      });
    } catch (err) {
      if (err instanceof PaymentValidationError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }

    payment = await this.paymentRepository.save(payment);

    try {
      const externalId = await this.paymentGateway.initiatePayment(payment);
      payment.moveToPending(externalId);
    } catch (err) {
      payment.fail();
      throw err;
    }
    finally {
      await this.paymentRepository.update(payment);
    }
    return payment;
  }
}
