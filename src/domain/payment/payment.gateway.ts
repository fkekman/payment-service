import type { PaymentEntity } from "./payment.entity";

export interface IPaymentGateway {
  initiatePayment(payment: PaymentEntity): Promise<string>
  getPaymentFee(): number;
}
