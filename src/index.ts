import { PaymentEntity } from "@domain/payment/payment.entity";
import type { IPaymentGateway } from "@domain/payment/payment.gateway";
import type { IPaymentRepository } from "@domain/payment/payment.repository";
import { CreatePaymentUseCase, type CreatePaymentInput } from "./use-cases/create-payment.use-cases";

class InMemoryPaymentRepository implements IPaymentRepository {
  private store: Map<string, PaymentEntity> = new Map();
  async findById(id: string): Promise<PaymentEntity | null> {
    return this.store.get(id) ?? null;
  }
  async save(data: PaymentEntity): Promise<PaymentEntity> {
    const { id } = data;
    this.store.set(id, data);
    return data;
  }
  async update(data: PaymentEntity): Promise<PaymentEntity> {
    const { id } = data;
    this.store.set(id, data);
    return data;
  }

}

class StubPaymentGateway implements IPaymentGateway {
  async initiatePayment(payment: PaymentEntity): Promise<string> {
    return 'extID134123'
  }

  getPaymentFee(): number {
    return 0.3;
  }
}


const repo = new InMemoryPaymentRepository();
const gateway = new StubPaymentGateway();

const createPaymentUseCase = new CreatePaymentUseCase(repo, gateway);

const request: CreatePaymentInput = {
  amountCents: 43.32,
  currency: 'RUB',
  merchantId: ''
};

const response = await createPaymentUseCase.execute(request);

console.log(response);
