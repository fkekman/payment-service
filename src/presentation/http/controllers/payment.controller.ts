import { CreatePaymentUseCase } from "@usecase/create-payment.use-case";
import { GetPaymentUseCase } from "@usecase/get-payment.use-case";
import { ProcessWebhookUseCase } from "@usecase/process-webhook.use-case";
import type { NextFunction, Request, Response } from "express";
import { RequestValidationError } from "../errors";
import { createPaymentDto } from "../dto/create-payment.dto";
import { processWebhookDto } from "../dto/process-webhook.dto";

export class PaymentController {
  constructor(
    private createPaymentUseCase: CreatePaymentUseCase,
    private processWebhookUseCase: ProcessWebhookUseCase,
    private getPaymentUseCase: GetPaymentUseCase
  ) { }

  async handleCreatePayment(req: Request, res: Response, next: NextFunction) {
    const validationResult = createPaymentDto.safeParse(req.body);
    if (!validationResult.success) {

      throw new RequestValidationError(validationResult.error.issues as any);
    }

    const { currency, merchantId, amount } = validationResult.data;

    const result = await this.createPaymentUseCase.execute({
      currency,
      merchantId,
      amountCents: amount * 100
    });
    res.send({ ...result, status: 'success' });
  }

  async handleProcessWebhook(req: Request, res: Response, next: NextFunction) {
    const validationResult = processWebhookDto.safeParse(req.body);
    if (!validationResult.success) {

      throw new RequestValidationError(validationResult.error.issues as any);
    }

    const { status, invoiceId } = validationResult.data;

    await this.processWebhookUseCase.execute({
      invoiceId,
      status,
    } as any);
    res.status(200).json({ status: 'success' });
  }

  async handleGetPayment(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw new RequestValidationError({
        'id': ['Id should be defined']
      });
    }

    const result = await this.getPaymentUseCase.execute(id);
    res.send(result);
  }
}
