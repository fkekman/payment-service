export interface IPaymentTransactionManager {
  runWithTransaction<T>(action: () => Promise<T>): Promise<T>;
}
