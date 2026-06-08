import type { DataProperties } from "@domain/shared/types/data-properties";
import type { PaymentEntity } from "./payment.entity";
import type { ReplaceFieldsByName } from "@domain/shared/types/replace-fields-by-name";

export type PaymentStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'COMPLETE'
  | 'FAIL';

export type CreatePaymentOptions = DataProperties<PaymentEntity>;

type CreateDraftFields = 'amountCents' | 'currency' | 'merchantId' | 'feePercent';
type BigNumFields = 'amountCents' | 'feePercent' | 'feeCents' | 'amountToReceiveCents';

export type LoadPaymentOptions = ReplaceFieldsByName<
  CreatePaymentOptions,
  BigNumFields,
  string
>;

export type CreateDraftPaymentOptions = Pick<
  ReplaceFieldsByName<
    CreatePaymentOptions,
    BigNumFields,
    number
  >, CreateDraftFields
>;

