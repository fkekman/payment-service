import Big from 'big.js';

import {
  PaymentStatus,
  type CreateDraftPaymentOptions,
  type CreatePaymentOptions,
  type LoadPaymentOptions,
  type PaymentStatusType,
} from './payment.types';
import { PaymentStatusError, PaymentValidationError } from './payment.errors';

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

    if (amountCents <= 0) {
      throw new PaymentValidationError('amountCents should be above zero');
    }

    if (feePercent < 0 || feePercent >= 1) {
      throw new PaymentValidationError('feePercent should be above zero and bellow 1')
    }

    if (merchantId.length === 0) {
      throw new PaymentValidationError('merchantId cant be empty');
    }

    if (currency.length !== 3) {
      throw new PaymentValidationError('currency should have length of 3');
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

  public canMoveToPending() {
    return this.status === PaymentStatus.DRAFT;
  }

  public moveToPending(externalId: string) {
    if (!this.canMoveToPending()) {
      throw new PaymentStatusError('Cant set to pending not from draft');
    }
    this.status = PaymentStatus.PENDING;
    this.externalId = externalId;
  }

  public canComplete() {
    return this.status === PaymentStatus.PENDING;
  }

  public complete() {
    if (!this.canComplete()) {
      throw new PaymentStatusError('Cant complete payment not from pending');
    }
    this.status = PaymentStatus.COMPLETE;
  }

  public canFail() {
    return this.status !== PaymentStatus.COMPLETE;
  }

  public fail() {
    if (!this.canFail()) {
      throw new PaymentStatusError('Cant fail already completed payment');
    }
    this.status = PaymentStatus.FAIL;
  }

  public isSettled() {
    return this.status === PaymentStatus.COMPLETE || this.status === PaymentStatus.FAIL;
  }
}
