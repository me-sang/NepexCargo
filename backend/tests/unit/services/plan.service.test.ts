const mockPlanTxRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};
const mockFeatureTxRepo = {
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};
const mockEm = {
  getRepository: jest.fn((entity: unknown) => {
    const { Plan } = require('@database/entities');
    return entity === Plan ? mockPlanTxRepo : mockFeatureTxRepo;
  }),
};

jest.mock('@database/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(() => mockBaseRepo),
    transaction: jest.fn(),
  },
}));

const mockBaseRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@database/repositories', () => ({
  planRepository: {
    find: jest.fn(),
    findWithFeatures: jest.fn(),
  },
  planFeatureRepository: {},
  tenantPlanRepository: {},
  userRepository: {},
  roleRepository: {},
  permissionRepository: {},
  tenantRepository: {},
  tenantSettingRepository: {},
  tenantDomainRepository: {},
  tenantConfigurationRepository: {},
  tenantUsageRepository: {},
  countryRepository: {},
  superAdminRepository: {},
}));

import { AppDataSource } from '@database/data-source';
import { planRepository } from '@database/repositories';
import { PlanService } from '@services/plan.service';
import { PlanBillingCycle } from '@database/entities/plan.entity';
import { PlanFeatureType } from '@database/entities/plan-feature.entity';

const mockPlanRepo = planRepository as jest.Mocked<typeof planRepository>;
const mockTransaction = AppDataSource.transaction as jest.Mock;

describe('PlanService', () => {
  let service: PlanService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PlanService();
    mockTransaction.mockImplementation(async (cb: (em: unknown) => Promise<unknown>) => cb(mockEm));
  });

  // ── listPlans ──────────────────────────────────────────────────────────────

  describe('listPlans', () => {
    it('returns all plans ordered by sortOrder', async () => {
      const plans = [{ id: '1' }, { id: '2' }];
      mockPlanRepo.find.mockResolvedValue(plans as never);

      const result = await service.listPlans();

      expect(mockPlanRepo.find).toHaveBeenCalledWith({
        relations: ['features'],
        order: { sortOrder: 'ASC' },
      });
      expect(result).toEqual(plans);
    });
  });

  // ── getPlan ────────────────────────────────────────────────────────────────

  describe('getPlan', () => {
    it('returns plan when found', async () => {
      const plan = { id: 'plan-1', features: [] };
      mockPlanRepo.findWithFeatures.mockResolvedValue(plan as never);

      const result = await service.getPlan('plan-1');
      expect(result).toEqual(plan);
    });

    it('throws NotFoundException when plan does not exist', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue(null);

      await expect(service.getPlan('missing-id')).rejects.toThrow('Plan not found');
    });
  });

  // ── createPlan ─────────────────────────────────────────────────────────────

  describe('createPlan', () => {
    const createData = {
      code: 'starter',
      name: 'Starter',
      billingOptions: [{ billingCycle: PlanBillingCycle.MONTHLY, price: 29, currency: 'USD' }],
      isPublic: true,
      isActive: true,
      sortOrder: 0,
      features: [{ featureKey: 'max_users', featureType: PlanFeatureType.NUMBER, featureValue: 10 }],
    };

    it('throws ConflictException when code already exists', async () => {
      mockPlanTxRepo.findOne.mockResolvedValue({ id: 'existing', code: 'starter' });

      await expect(service.createPlan(createData)).rejects.toThrow('Plan code already in use');
    });

    it('creates plan and features inside a transaction', async () => {
      mockPlanTxRepo.findOne.mockResolvedValue(null);
      const savedPlan = { id: 'new-plan-id', ...createData };
      mockPlanTxRepo.create.mockReturnValue(savedPlan);
      mockPlanTxRepo.save.mockResolvedValue(savedPlan);
      const feature = { id: 'feat-1', planId: 'new-plan-id' };
      mockFeatureTxRepo.create.mockReturnValue(feature);
      mockFeatureTxRepo.save.mockResolvedValue([feature]);
      // getPlan called after transaction
      mockPlanRepo.findWithFeatures.mockResolvedValue({ ...savedPlan, features: [feature] } as never);

      const result = await service.createPlan(createData);

      expect(mockTransaction).toHaveBeenCalled();
      expect(mockPlanTxRepo.save).toHaveBeenCalled();
      expect(mockFeatureTxRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('new-plan-id');
    });

    it('skips feature insert when features array is empty', async () => {
      mockPlanTxRepo.findOne.mockResolvedValue(null);
      const savedPlan = { id: 'new-plan-id' };
      mockPlanTxRepo.create.mockReturnValue(savedPlan);
      mockPlanTxRepo.save.mockResolvedValue(savedPlan);
      mockPlanRepo.findWithFeatures.mockResolvedValue({ ...savedPlan, features: [] } as never);

      await service.createPlan({ ...createData, features: [] });

      expect(mockFeatureTxRepo.save).not.toHaveBeenCalled();
    });
  });

  // ── updatePlan ─────────────────────────────────────────────────────────────

  describe('updatePlan', () => {
    const existingPlan = { id: 'plan-1', code: 'starter', name: 'Starter', features: [] };

    it('throws NotFoundException when plan does not exist', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue(null);

      await expect(service.updatePlan('missing', { name: 'New' })).rejects.toThrow('Plan not found');
    });

    it('throws ConflictException when new code is already taken by another plan', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue(existingPlan as never);
      mockPlanTxRepo.findOne.mockResolvedValue({ id: 'other-plan', code: 'business' });

      await expect(service.updatePlan('plan-1', { code: 'business' })).rejects.toThrow(
        'Plan code already in use',
      );
    });

    it('updates plan fields and replaces features when features are provided', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue({ ...existingPlan } as never);
      mockPlanTxRepo.findOne.mockResolvedValue(null);
      mockPlanTxRepo.save.mockResolvedValue({ ...existingPlan, name: 'Updated' });
      const newFeature = { featureKey: 'k', featureType: PlanFeatureType.BOOLEAN, featureValue: true };
      mockFeatureTxRepo.create.mockReturnValue({ id: 'f1', planId: 'plan-1', ...newFeature });
      mockFeatureTxRepo.save.mockResolvedValue([]);
      mockPlanRepo.findWithFeatures.mockResolvedValueOnce(existingPlan as never)
        .mockResolvedValueOnce({ ...existingPlan, name: 'Updated', features: [newFeature] } as never);

      const result = await service.updatePlan('plan-1', { name: 'Updated', features: [newFeature] });

      expect(mockFeatureTxRepo.delete).toHaveBeenCalledWith({ planId: 'plan-1' });
      expect(mockFeatureTxRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated');
    });

    it('does not touch features when features field is not provided', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue({ ...existingPlan } as never)
        .mockResolvedValue({ ...existingPlan } as never);
      mockPlanTxRepo.save.mockResolvedValue(existingPlan);

      await service.updatePlan('plan-1', { name: 'Only Name Change' });

      expect(mockFeatureTxRepo.delete).not.toHaveBeenCalled();
    });

    it('skips code uniqueness check when code is unchanged', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue({ ...existingPlan } as never);
      mockPlanTxRepo.save.mockResolvedValue(existingPlan);

      await service.updatePlan('plan-1', { code: 'starter' }); // same code

      expect(mockPlanTxRepo.findOne).not.toHaveBeenCalled();
    });
  });

  // ── deletePlan ─────────────────────────────────────────────────────────────

  describe('deletePlan', () => {
    it('throws NotFoundException when plan does not exist', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue(null);

      await expect(service.deletePlan('missing')).rejects.toThrow('Plan not found');
    });

    it('throws BadRequestException with tenant count when active subscriptions exist', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue({ id: 'plan-1' } as never);
      mockBaseRepo.count.mockResolvedValue(3);

      await expect(service.deletePlan('plan-1')).rejects.toThrow(
        'Cannot delete plan: 3 tenant(s) have an active subscription on this plan',
      );
    });

    it('hard-deletes plan when no active subscriptions exist', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue({ id: 'plan-1' } as never);
      mockBaseRepo.count.mockResolvedValue(0);
      mockBaseRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deletePlan('plan-1');

      expect(mockBaseRepo.delete).toHaveBeenCalledWith('plan-1');
    });
  });
});
