import type { DataProperties } from "../shared/types/data-properties";
import type { PaymentStatus } from "./payment-status";

export interface CreateDraftPaymentOptions {
  amount: number;
  currency: string;
  merchantId: string;

  feePercent: number;
}

export type CreatePaymentOptions = DataProperties<PaymentEntity>;
export type LoadPaymentOptions = CreatePaymentOptions;

export class PaymentEntity {
  public id!: string;
  public amount!: number;
  public currency!: string;
  public merchantId!: string;
  public feePercent!: number;
  public fee!: number;
  public amountToReceive!: number;
  public status!: PaymentStatus;
  public createdAt!: Date;
  public externalId?: string;

  private constructor(data: LoadPaymentOptions) {
    Object.assign(this, data);
  }

  public static load(data: LoadPaymentOptions): PaymentEntity {
    return new PaymentEntity(data);
  }

  public static createDraft(options: CreateDraftPaymentOptions): PaymentEntity {
    const { amount, currency, merchantId, feePercent } = options;

    const fee = amount * feePercent;
    const amountToReceive = amount - fee;
    const status = 'DRAFT';
    const createdAt = new Date();
    return new PaymentEntity({
      id: crypto.randomUUID(),
      amount,
      currency,
      merchantId,
      feePercent,
      fee,
      amountToReceive,
      status,
      createdAt,
    });
  }

  public toPending(externalId: string) {
    if (this.status !== 'DRAFT') {
      throw new Error('Cant set to pending not from draft');
    }
    this.status = 'PENDING';
    this.externalId = externalId;
  }

  public complete() {
    if (this.status !== 'PENDING') {
      throw new Error('Cant complete payment not from pending');
    }
    this.status = 'COMPLETE';
  }

  public fail() {
    if (this.status === 'COMPLETE') {
      throw new Error('Cant fail already completed payment');
    }
    this.status = 'FAIL';
  }
}
