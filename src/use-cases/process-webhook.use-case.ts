import type { IPaymentRepository } from "@domain/payment/payment.repository";
import { PaymentStatus } from "@domain/payment/payment.types";
import { BadRequestError, NotFoundError, PaymentStateConflict } from "./errors";

export interface ProcessWebhookInput {
  invoiceId: string;
  status: 'paid' | 'failed';
}

export class ProcessWebhookUseCase {
  constructor(
    private paymentRepository: IPaymentRepository,
  ) { }

  async execute(data: ProcessWebhookInput): Promise<void> {

    const { invoiceId, status } = data;

    const foundPayment = await this.paymentRepository.findById(invoiceId);
    if (!foundPayment) {
      throw new NotFoundError('Payment not found');
    }

    // TODO: Domain violation
    switch (status) {
      case 'paid': {
        if (foundPayment.status === PaymentStatus.COMPLETE) return;
        if (!foundPayment.canComplete()) {
          throw new PaymentStateConflict('Cant complete payment');
        }
        foundPayment.complete();
        break;
      }
      case 'failed': {
        if (foundPayment.status === PaymentStatus.FAIL) return;
        if (!foundPayment.canComplete()) {
          throw new PaymentStateConflict('Cant fail payment');
        }
        foundPayment.fail();
        break;
      }
      default: {
        throw new BadRequestError('Unexpected payment status');
      }
    }
    const updated =
      await this.paymentRepository.updateWithStatusCheck(foundPayment, PaymentStatus.PENDING);
    if (!updated) {
      console.warn('Concurent request! Update failed');
    }
  }
}
