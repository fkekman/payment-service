import type { PaymentEntity } from "@domain/payment/payment.entity";
import type { IPaymentGateway } from "@domain/payment/payment.gateway";

export class MockPaymentGateway implements IPaymentGateway {
  async initiatePayment(_payment: PaymentEntity): Promise<string> {
    const uiid = crypto.randomUUID();
    return `ext-${uiid}`;
  }
  getPaymentFee(): number {
    return 0.1;
  }

}
