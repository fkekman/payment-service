import z from 'zod';

export const createPaymentDto = z.object({
  amount: z.number(),
  currency: z.string(),
  merchantId: z.string(),
});

