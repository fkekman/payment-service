import type { IPaymentTransactionManager } from "@domain/payment/payment-transaction.manager";
import type { IPaymentRepository } from "@domain/payment/payment.repository";

export interface ProcessWebhookInput {
  invoiceId: string;
  status: 'paid' | 'failed';
}

export class ProcessWebhookUseCase {
  constructor(
    private paymentRepository: IPaymentRepository,
    private paymentTransactionManager: IPaymentTransactionManager
  ) { }

  async execute(data: ProcessWebhookInput): Promise<void> {
    await this.paymentTransactionManager.runWithTransaction(async () => {
      const { invoiceId, status } = data;

      const foundPayment = await this.paymentRepository.findById(invoiceId);
      if (!foundPayment) {
        throw new Error('Payment not found');
      }

      if (foundPayment.isSettled()) {
        return;
      }

      if (!foundPayment.isCompletable()) {
        throw new Error('Cant complete payment');
      }

      switch (status) {
        case 'paid': {
          foundPayment.complete();
          break;
        }
        case 'failed': {
          foundPayment.fail();
          break;
        }
        default: {
          throw new Error('Unexpected payment status');
        }
      }
      await this.paymentRepository.update(foundPayment);
    });

  }
}
