import type { PaymentEntity } from "../entities/payment.entity";

export interface IPaymentRepository {
  findById(id: string): Promise<PaymentEntity>;
  save(data: PaymentEntity): Promise<PaymentEntity>;
}
