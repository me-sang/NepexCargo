import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { Tenant, User, TenantPlan } from '../entities';
import { planRepository, roleRepository, tenantRepository, userRepository } from '../repositories';
import { TenantStatus, TenantAccountType, TenantPlanStatus, TenantPlanRenewalType } from '../../common/enums/tenant.enums';
import { UserRole } from '../../config/permission.enums';
import { env } from '../../config/env.config';
import { logger } from '../../common/helpers/logger';

const TENANT_CODE = 'NEPEX-001';
const ENTERPRISE_PLAN_CODE = 'enterprise';

export const defaultTenantSeeder = {
  name: '006-default-tenant',
  run: async (): Promise<void> => {
    // ── Guard — skip if tenant already exists ────────────────────────────────
    const existing = await tenantRepository.findByCode(TENANT_CODE);
    if (existing) return;

    // ── Resolve dependencies ─────────────────────────────────────────────────
    const enterprisePlan = await planRepository.findByCode(ENTERPRISE_PLAN_CODE);
    if (!enterprisePlan) {
      throw new Error(`Plan '${ENTERPRISE_PLAN_CODE}' not found — run plan seeder first`);
    }

    const ownerRole = await roleRepository.findOne({ where: { name: UserRole.PARTNER_OWNER } });
    if (!ownerRole) {
      throw new Error(`Role '${UserRole.PARTNER_OWNER}' not found — run roles seeder first`);
    }

    await AppDataSource.transaction(async (em) => {
      const tenantRepo = em.getRepository(Tenant);
      const userRepo = em.getRepository(User);
      const tenantPlanRepo = em.getRepository(TenantPlan);

      // ── 1. Create tenant ───────────────────────────────────────────────────
      const tenant = tenantRepo.create({
        code: TENANT_CODE,
        slug: 'nepex-cargo',
        legalName: 'Nepex Cargo LLC',
        displayName: 'Nepex Cargo',
        email: 'info@nepexcargo.com',
        phone: '+971500000000',
        currency: 'USD',
        status: TenantStatus.ACTIVE,
        accountType: TenantAccountType.REGULAR,
        walletBalance: 0,
        isVerified: true,
        onboardingCompleted: true,
      });
      const savedTenant = await tenantRepo.save(tenant);

      // ── 2. Assign enterprise plan subscription ─────────────────────────────
      const now = new Date();
      const oneYearLater = new Date(now);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

      const subscription = tenantPlanRepo.create({
        tenantId: savedTenant.id,
        planId: enterprisePlan.id,
        startsAt: now,
        expiresAt: oneYearLater,
        renewalType: TenantPlanRenewalType.YEARLY,
        status: TenantPlanStatus.ACTIVE,
        autoRenew: true,
        billingCycle: 1,
        amount: 0,
        currency: 'USD',
      });
      await tenantPlanRepo.save(subscription);

      // ── 3. Create tenant owner user ────────────────────────────────────────
      const hashedPassword = await bcrypt.hash(env.DEFAULT_TENANT_USER_PASSWORD, 10);

      const user = userRepo.create({
        email: env.DEFAULT_TENANT_USER_EMAIL,
        password: hashedPassword,
        firstName: 'Nepex',
        lastName: 'Owner',
        tenantId: savedTenant.id,
        isEmailVerified: true,
        status: 'active',
        roles: [ownerRole],
      });
      await userRepo.save(user);
    });

    logger.info(`[Seeder] Default tenant created — email: ${env.DEFAULT_TENANT_USER_EMAIL} | password: ${env.DEFAULT_TENANT_USER_PASSWORD}`);
  },
};
