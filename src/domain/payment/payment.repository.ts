import type { PaymentEntity } from "./payment.entity";
import type { PaymentStatusType } from "./payment.types";

export interface IPaymentRepository {
  findById(id: string): Promise<PaymentEntity | null>;
  save(data: PaymentEntity): Promise<PaymentEntity>;
  update(data: PaymentEntity): Promise<PaymentEntity>;
  updateWithStatusCheck(data: PaymentEntity, expectedStatus: PaymentStatusType): Promise<boolean>;
}
