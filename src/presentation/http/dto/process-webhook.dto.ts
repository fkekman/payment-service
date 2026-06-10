import z from 'zod';

export const processWebhookDto = z.object({
  status: z.string(),
  invoiceId: z.string()
});
