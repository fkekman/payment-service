import type { PaymentEntity } from "../entities/payment.entity";

export interface IPaymentGateway {
  initiatePayment(payment: PaymentEntity): Promise<PaymentEntity>
  getPaymentFee(): Promise<number>;
}
