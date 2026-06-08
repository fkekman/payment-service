export interface ICompletedPaymentRepository {
  has(id: string): Promise<boolean>;
  add(id: string): Promise<void>;
}
