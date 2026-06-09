import z from 'zod';

export const PaymentSchema = z.object({
  amountCents: z.number().positive('Amount should be positive'),
  currency: z.string().length(3, 'Currency should be in ISO format (3 chars)'),
  feePercent: z.number().min(0).max(1, 'Fee percent should be between 0 and 1'),
});
