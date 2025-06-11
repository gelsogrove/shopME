import {
    PlanType,
    canAddProduct,
    canAddService,
    getMaxProducts,
    getMaxServices,
    getPlanLimitErrorMessage,
    getPlanLimits
} from '../../../utils/planLimits';

describe('Plan Limits Utility', () => {
  describe('getPlanLimits', () => {
    it('should return correct limits for FREE plan', () => {
      const limits = getPlanLimits(PlanType.FREE);
      expect(limits.maxProducts).toBe(3);
      expect(limits.maxServices).toBe(3);
      expect(limits.maxAIMessages).toBe(100);
      expect(limits.maxWhatsAppChannels).toBe(1);
    });

    it('should return correct limits for BASIC plan', () => {
      const limits = getPlanLimits(PlanType.BASIC);
      expect(limits.maxProducts).toBe(5);
      expect(limits.maxServices).toBe(5);
      expect(limits.maxAIMessages).toBe(1000);
      expect(limits.maxWhatsAppChannels).toBe(1);
    });

    it('should return correct limits for PROFESSIONAL plan', () => {
      const limits = getPlanLimits(PlanType.PROFESSIONAL);
      expect(limits.maxProducts).toBe(100);
      expect(limits.maxServices).toBe(100);
      expect(limits.maxAIMessages).toBe(5000);
      expect(limits.maxWhatsAppChannels).toBe(3);
    });
  });

  describe('canAddProduct', () => {
    it('should allow adding products when under FREE plan limit', () => {
      expect(canAddProduct(PlanType.FREE, 0)).toBe(true);
      expect(canAddProduct(PlanType.FREE, 2)).toBe(true);
    });

    it('should not allow adding products when at FREE plan limit', () => {
      expect(canAddProduct(PlanType.FREE, 3)).toBe(false);
      expect(canAddProduct(PlanType.FREE, 5)).toBe(false);
    });

    it('should allow adding products when under BASIC plan limit', () => {
      expect(canAddProduct(PlanType.BASIC, 0)).toBe(true);
      expect(canAddProduct(PlanType.BASIC, 4)).toBe(true);
    });

    it('should not allow adding products when at BASIC plan limit', () => {
      expect(canAddProduct(PlanType.BASIC, 5)).toBe(false);
      expect(canAddProduct(PlanType.BASIC, 10)).toBe(false);
    });

    it('should allow adding products when under PROFESSIONAL plan limit', () => {
      expect(canAddProduct(PlanType.PROFESSIONAL, 0)).toBe(true);
      expect(canAddProduct(PlanType.PROFESSIONAL, 99)).toBe(true);
    });

    it('should not allow adding products when at PROFESSIONAL plan limit', () => {
      expect(canAddProduct(PlanType.PROFESSIONAL, 100)).toBe(false);
      expect(canAddProduct(PlanType.PROFESSIONAL, 150)).toBe(false);
    });
  });

  describe('canAddService', () => {
    it('should allow adding services when under FREE plan limit', () => {
      expect(canAddService(PlanType.FREE, 0)).toBe(true);
      expect(canAddService(PlanType.FREE, 2)).toBe(true);
    });

    it('should not allow adding services when at FREE plan limit', () => {
      expect(canAddService(PlanType.FREE, 3)).toBe(false);
      expect(canAddService(PlanType.FREE, 5)).toBe(false);
    });

    it('should allow adding services when under PROFESSIONAL plan limit', () => {
      expect(canAddService(PlanType.PROFESSIONAL, 0)).toBe(true);
      expect(canAddService(PlanType.PROFESSIONAL, 99)).toBe(true);
    });

    it('should not allow adding services when at PROFESSIONAL plan limit', () => {
      expect(canAddService(PlanType.PROFESSIONAL, 100)).toBe(false);
      expect(canAddService(PlanType.PROFESSIONAL, 150)).toBe(false);
    });
  });

  describe('getMaxProducts', () => {
    it('should return numeric limits for all plans', () => {
      expect(getMaxProducts(PlanType.FREE)).toBe(3);
      expect(getMaxProducts(PlanType.BASIC)).toBe(5);
      expect(getMaxProducts(PlanType.PROFESSIONAL)).toBe(100);
    });
  });

  describe('getMaxServices', () => {
    it('should return numeric limits for all plans', () => {
      expect(getMaxServices(PlanType.FREE)).toBe(3);
      expect(getMaxServices(PlanType.BASIC)).toBe(5);
      expect(getMaxServices(PlanType.PROFESSIONAL)).toBe(100);
    });
  });

  describe('getPlanLimitErrorMessage', () => {
    it('should return appropriate error message for FREE plan products', () => {
      const message = getPlanLimitErrorMessage(PlanType.FREE, 'products');
      expect(message).toContain('FREE plan');
      expect(message).toContain('3 products');
      expect(message).toContain('upgrade');
    });

    it('should return appropriate error message for BASIC plan services', () => {
      const message = getPlanLimitErrorMessage(PlanType.BASIC, 'services');
      expect(message).toContain('BASIC plan');
      expect(message).toContain('5 services');
      expect(message).toContain('upgrade');
    });

    it('should return appropriate error message for PROFESSIONAL plan', () => {
      const message = getPlanLimitErrorMessage(PlanType.PROFESSIONAL, 'products');
      expect(message).toContain('PROFESSIONAL plan');
      expect(message).toContain('100 products');
      expect(message).toContain('upgrade');
    });
  });
}); 