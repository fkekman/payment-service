import { ObjectId, type Db } from "mongodb";

import { PaymentEntity } from "@domain/payment/payment.entity";
import type { IPaymentRepository } from "@domain/payment/payment.repository";
import type { PaymentStatusType } from "@domain/payment/payment.types";
import type { PaymentDocument } from "./documents/payment.document";

export class MongoPaymentRepository implements IPaymentRepository {
  static COLLECTION_NAME = 'payment';
  constructor(
    private db: Db
  ) { }

  protected toDomain(doc: PaymentDocument): PaymentEntity {
    return PaymentEntity.load({
      id: doc._id.toString(), // 🌟 Берём значение из _id и превращаем в понятный домену id
      status: doc.status as any,
      amountCents: doc.amountCents,
      currency: doc.currency,
      merchantId: doc.merchantId,
      feePercent: doc.feePercent,
      feeCents: doc.feeCents,
      amountToReceiveCents: doc.amountToReceiveCents,
      createdAt: doc.createdAt,
      externalId: doc.externalId,
    });
  }

  private toDocument(payment: PaymentEntity): PaymentDocument {
    return {
      _id: payment.id,
      status: payment.status,
      amountCents: payment.amountCents.toFixed(2),
      currency: payment.currency,
      merchantId: payment.merchantId,
      feePercent: payment.feePercent.toFixed(2),
      feeCents: payment.feeCents.toFixed(2),
      amountToReceiveCents: payment.amountToReceiveCents.toFixed(2),
      createdAt: payment.createdAt,
      externalId: payment.externalId,
    };
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const doc = await this.db
      .collection<PaymentDocument>(MongoPaymentRepository.COLLECTION_NAME)
      .findOne({ _id: id });

    if (!doc) return null;

    return this.toDomain(doc);
  }

  async save(data: PaymentEntity): Promise<PaymentEntity> {
    await this.db
      .collection<PaymentDocument>(MongoPaymentRepository.COLLECTION_NAME)
      .insertOne(this.toDocument(data));
    return data;
  }

  async update(data: PaymentEntity): Promise<PaymentEntity> {
    await this.db
      .collection<PaymentDocument>(MongoPaymentRepository.COLLECTION_NAME)
      .updateOne({ _id: data.id }, {
        $set: {
          status: data.status,
          externalId: data.externalId,
        }
      });
    return data;
  }

  async updateWithStatusCheck(data: PaymentEntity, expectedStatus: PaymentStatusType): Promise<boolean> {
    const result = await this.db
      .collection<PaymentDocument>(MongoPaymentRepository.COLLECTION_NAME)
      .updateOne({ _id: data.id, status: expectedStatus }, { $set: { status: data.status } });

    return result.modifiedCount > 0;
  }

}
