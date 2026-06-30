import { AppDataSource } from '@database/data-source';
import { TenantPlan } from '@database/entities';
import { tenantPlanRepository, tenantRepository, planRepository } from '@database/repositories';
import { TenantPlanStatus } from '@common/enums/tenant.enums';
import { NotFoundException, BadRequestException } from '@common/exceptions/app.exception';
import type {
  CreateSubscriptionDTO,
  UpdateSubscriptionDTO,
  ListSubscriptionsQueryDTO,
} from '@common/dto/subscription.dto';

export class SubscriptionService {
  private tenantPlanRepo = AppDataSource.getRepository(TenantPlan);

  async listSubscriptions(filters: ListSubscriptionsQueryDTO = {}): Promise<TenantPlan[]> {
    const where: Record<string, unknown> = {};
    if (filters.tenantId) where.tenantId = filters.tenantId;
    if (filters.status) where.status = filters.status;

    return this.tenantPlanRepo.find({
      where,
      relations: ['tenant', 'plan', 'plan.features'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSubscription(id: string): Promise<TenantPlan> {
    const subscription = await tenantPlanRepository.findById(id);
    if (!subscription) throw new NotFoundException('Subscription');
    return subscription;
  }

  async createSubscription(data: CreateSubscriptionDTO): Promise<TenantPlan> {
    const tenant = await tenantRepository.findOne({ where: { id: data.tenantId } });
    if (!tenant) throw new NotFoundException('Tenant');

    const plan = await planRepository.findOne({ where: { id: data.planId } });
    if (!plan) throw new NotFoundException('Plan');
    if (!plan.isActive) throw new BadRequestException('Plan is not active');

    const subscription = this.tenantPlanRepo.create({
      tenantId: data.tenantId,
      planId: data.planId,
      startsAt: data.startsAt,
      expiresAt: data.expiresAt ?? null,
      renewalType: data.renewalType ?? null,
      status: data.status,
      autoRenew: data.autoRenew,
      billingCycle: data.billingCycle,
      amount: data.amount ?? null,
      currency: data.currency ?? null,
    });

    const saved = await this.tenantPlanRepo.save(subscription);
    return this.getSubscription(saved.id);
  }

  async updateSubscription(id: string, data: UpdateSubscriptionDTO): Promise<TenantPlan> {
    const subscription = await this.getSubscription(id);

    if (data.planId && data.planId !== subscription.planId) {
      const plan = await planRepository.findOne({ where: { id: data.planId } });
      if (!plan) throw new NotFoundException('Plan');
      if (!plan.isActive) throw new BadRequestException('Plan is not active');
    }

    Object.assign(subscription, data);
    await this.tenantPlanRepo.save(subscription);
    return this.getSubscription(id);
  }

  async deleteSubscription(id: string): Promise<TenantPlan> {
    const subscription = await this.getSubscription(id);
    subscription.status = TenantPlanStatus.CANCELLED;
    await this.tenantPlanRepo.save(subscription);
    return this.getSubscription(id);
  }
}

export const subscriptionService = new SubscriptionService();
