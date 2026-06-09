import { describe, it, expect } from 'vitest';
import { PaymentEntity } from './payment.entity';
import { PaymentStatus } from './payment.types';
import Big from 'big.js';

describe('PaymentEntity', () => {

  const defaultData = {
    id: 'someid',
    amountCents: '13.21',
    currency: 'RUB',
    merchantId: 'mid',
    feePercent: '0.12',
    feeCents: '1.5',
    amountToReceiveCents: '12.2',
    status: PaymentStatus.DRAFT,
    createdAt: new Date()
  };

  describe('createDraft', () => {
    it('creates draft payment', () => {
      const data = {
        amountCents: 25,
        currency: 'RUB',
        merchantId: 'someid',
        feePercent: 0.2,
      };
      const payment = PaymentEntity.createDraft(data);

      // Status changed to draft
      expect(payment.status).toBe(PaymentStatus.DRAFT);

      // Correct calculations
      expect(payment.amountCents.eq(Big(25))).toBe(true);
      expect(payment.feePercent.eq(Big(0.2))).toBe(true);
      expect(payment.feeCents.eq(Big(5))).toBe(true);
      expect(payment.amountToReceiveCents.eq(Big(20))).toBe(true);
    });

    it('error if incorrect input', () => {
      const correctData = {
        amountCents: 25,
        currency: 'RUB',
        merchantId: 'someid',
        feePercent: 0.2,
      };

      expect(() => PaymentEntity.createDraft({
        ...correctData,
        amountCents: -43,
      })).toThrow();

      expect(() => PaymentEntity.createDraft({
        ...correctData,
        feePercent: 5
      })).toThrow();

      expect(() => PaymentEntity.createDraft({
        ...correctData,
        feePercent: -12
      })).toThrow();
    });
  });

  describe('DRAFT-ANY', () => {
    it('works', () => {
      const externalId = 'someExternalId';

      const payment = PaymentEntity.load(defaultData);
      payment.toPending(externalId);

      expect(payment.status).toBe(PaymentStatus.PENDING);
      expect(payment.externalId).toBe(externalId);
    });

    it('error if not from draft', () => {
      [
        PaymentStatus.COMPLETE,
        PaymentStatus.FAIL,
        PaymentStatus.PENDING,
      ].forEach(status => {
        const data = {
          ...defaultData,
          status,
        };

        const externalId = 'someExternalId';

        const payment = PaymentEntity.load(data);
        expect(() => payment.toPending(externalId)).toThrow()
      })
    });
  });

  describe('PENDING-ANY', () => {
    it('works', () => {
      const data = {
        ...defaultData,
        status: PaymentStatus.PENDING,
        externalId: 'someExtId',
      };

      const payment = PaymentEntity.load(data);
      payment.complete();

      expect(payment.status).toBe(PaymentStatus.COMPLETE);
    });
    it('error if not from pending', () => {
      [
        PaymentStatus.DRAFT,
        PaymentStatus.COMPLETE,
        PaymentStatus.FAIL,
      ].forEach(status => {
        const data = {
          ...defaultData,
          status,
          externalId: 'someExtId',
        };

        const payment = PaymentEntity.load(data);

        expect(() => payment.complete()).toThrow();
      });
    });
  });

  describe('ANY-FAIL', () => {
    it('works', () => {
      [
        PaymentStatus.DRAFT,
        PaymentStatus.PENDING,
        PaymentStatus.FAIL,
      ].forEach(status => {
        const data = {
          ...defaultData,
          status,
          externalId: 'someExtId',
        };

        const payment = PaymentEntity.load(data);
        payment.fail();
        expect(payment.status).toBe(PaymentStatus.FAIL);
      });
    });
    it('error if from complete', () => {
      const data = {
        ...defaultData,
        status: PaymentStatus.COMPLETE,
        externalId: 'someExtId',
      };

      const payment = PaymentEntity.load(data);
      expect(() => payment.fail()).toThrow();
    })
  })


});
