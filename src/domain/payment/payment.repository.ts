import type { PaymentEntity } from "./payment.entity";

export interface IPaymentRepository {
  findById(id: string): Promise<PaymentEntity | null>;
  save(data: PaymentEntity): Promise<PaymentEntity>;
  update(data: PaymentEntity): Promise<PaymentEntity>;
}
