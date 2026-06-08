import Big from 'big.js';

import type {
  CreateDraftPaymentOptions,
  CreatePaymentOptions,
  LoadPaymentOptions,
  PaymentStatus
} from './payment.types';
import { PaymentSchema } from './payment.schema';

export class PaymentEntity {
  public id!: string;
  public amountCents!: Big;
  public currency!: string;
  public merchantId!: string;
  public feePercent!: Big;
  public feeCents!: Big;
  public amountToReceiveCents!: Big;
  public status!: PaymentStatus;
  public createdAt!: Date;
  public externalId?: string;

  private constructor(data: CreatePaymentOptions) {
    const { amountCents, currency, feePercent } = data;
    const result = PaymentSchema.safeParse({ amountCents, currency, feePercent });

    if (!result.success) {
      throw new Error(result.error.issues[0]?.message);
    }

    Object.assign(this, data);
  }

  public static load(data: LoadPaymentOptions): PaymentEntity {
    const { amountCents, feePercent, feeCents, amountToReceiveCents } = data;
    return new PaymentEntity({
      ...data,
      amountCents: Big(amountCents),
      feePercent: Big(feePercent),
      feeCents: Big(feeCents),
      amountToReceiveCents: Big(amountToReceiveCents),
    });
  }

  public static createDraft(options: CreateDraftPaymentOptions): PaymentEntity {
    const { amountCents, currency, merchantId, feePercent } = options;

    const _amountCents = Big(amountCents);
    const _feePercent = Big(feePercent);
    const _feeCents = _amountCents.times(_feePercent);
    const _amountToReceiveCents = _amountCents.sub(_feeCents);

    const status = 'DRAFT';
    const createdAt = new Date();
    return new PaymentEntity({
      id: crypto.randomUUID(),
      amountCents: _amountCents,
      currency,
      merchantId,
      feePercent: _feePercent,
      feeCents: _feeCents,
      amountToReceiveCents: _amountToReceiveCents,
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

  public isSettled() {
    return this.status === 'FAIL' || this.status === 'COMPLETE';
  }

  public isCompletable() {
    return this.status === 'PENDING';
  }
}
