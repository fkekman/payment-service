import Big from 'big.js';

import {
  PaymentStatus,
  type CreateDraftPaymentOptions,
  type CreatePaymentOptions,
  type LoadPaymentOptions,
  type PaymentStatusType,
} from './payment.types';
import { PaymentSchema } from './payment.schema';

export class PaymentEntity {
  public readonly id!: string;
  public readonly amountCents!: Big;
  public readonly currency!: string;
  public readonly merchantId!: string;
  public readonly feePercent!: Big;
  public feeCents!: Big;
  public amountToReceiveCents!: Big;
  public status!: PaymentStatusType;
  public createdAt!: Date;
  public externalId?: string | undefined;

  private constructor(data: CreatePaymentOptions) {
    this.id = data.id;
    this.amountCents = data.amountCents;
    this.currency = data.currency;
    this.merchantId = data.merchantId;
    this.feePercent = data.feePercent;
    this.feeCents = data.feeCents;
    this.amountToReceiveCents = data.amountToReceiveCents;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.externalId = data.externalId;

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

    const result = PaymentSchema.safeParse({ amountCents, currency, feePercent });
    if (!result.success) {
      throw new Error(result.error.issues[0]?.message);
    }

    const _amountCents = Big(amountCents);
    const _feePercent = Big(feePercent);
    const _feeCents = _amountCents.times(_feePercent).round(0, Big.roundHalfUp);
    const _amountToReceiveCents = _amountCents.sub(_feeCents);

    const status = PaymentStatus.DRAFT;
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
    if (this.status !== PaymentStatus.DRAFT) {
      throw new Error('Cant set to pending not from draft');
    }
    this.status = PaymentStatus.PENDING;
    this.externalId = externalId;
  }

  public complete() {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error('Cant complete payment not from pending');
    }
    this.status = PaymentStatus.COMPLETE;
  }

  public fail() {
    if (this.status === PaymentStatus.COMPLETE) {
      throw new Error('Cant fail already completed payment');
    }
    this.status = PaymentStatus.FAIL;
  }

  public isSettled() {
    return this.status === PaymentStatus.FAIL || this.status === PaymentStatus.COMPLETE;
  }

  public isCompletable() {
    return this.status === PaymentStatus.PENDING;
  }
}
