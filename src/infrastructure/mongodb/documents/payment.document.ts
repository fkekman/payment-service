export interface PaymentDocument {
  _id: string;
  status: string;
  amountCents: string;
  currency: string;
  merchantId: string;
  feePercent: string;
  feeCents: string;
  amountToReceiveCents: string;
  createdAt: Date,
  externalId: string | undefined;
}

