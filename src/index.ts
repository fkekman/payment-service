import { CreatePaymentUseCase, type CreatePaymentInput } from "./use-cases/create-payment.use-case";
import { client as mongoClient } from "./infrastructure/mongodb/client";
import { MongoPaymentRepository } from "./infrastructure/mongodb/mongo-payment.repository";
import { MockPaymentGateway } from "./infrastructure/payment-gateways/mock-payment.gateway";
import { ProcessWebhookUseCase } from "./use-cases/process-webhook.use-case";
import { GetPaymentUseCase } from "./use-cases/get-payment.use-case";
import { ExpressServer } from "./presentation/http/server";
import { PaymentController } from "./presentation/http/controllers/payment.controller";




const repo = new MongoPaymentRepository(mongoClient.db('payment_platform'));
const gateway = new MockPaymentGateway();

const createPaymentUseCase = new CreatePaymentUseCase(repo, gateway);
const processWebhookUseCase = new ProcessWebhookUseCase(repo);
const getPaymentUseCase = new GetPaymentUseCase(repo);

const paymentController = new PaymentController(
  createPaymentUseCase,
  processWebhookUseCase,
  getPaymentUseCase,
);

const expressServer = new ExpressServer(paymentController);

await expressServer.run();

console.log('App started!');


