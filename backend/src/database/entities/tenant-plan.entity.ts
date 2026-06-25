import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantPlanRenewalType, TenantPlanStatus } from '../../common/enums/tenant.enums';
import { Tenant } from './tenant.entity';
import { Plan } from './plan.entity';

@Entity('tenant_plans')
@Index(['tenantId'])
export class TenantPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  planId: string;

  /** When the current subscription period begins. */
  @Column({ type: 'timestamp' })
  startsAt: Date;

  /** When the current subscription period ends; null for open-ended subscriptions. */
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  /** How the plan renews — monthly | yearly | custom. */
  @Column({ type: 'varchar', length: 30, nullable: true, enum: TenantPlanRenewalType })
  renewalType: TenantPlanRenewalType;

  /** Current subscription state — trial | active | expired | cancelled | paused. */
  @Column({ type: 'varchar', length: 30, nullable: true, enum: TenantPlanStatus })
  status: TenantPlanStatus;

  /** Whether the plan should renew automatically at period end. */
  @Column({ default: true })
  autoRenew: boolean;

  /** Number of billing periods per renewal, e.g. 1 = every cycle, 12 = annual prepay. */
  @Column({ default: 1 })
  billingCycle: number;

  /** Actual amount charged at subscription time (may differ from plan list price). */
  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  amount: number;

  /** Currency of the charged amount, ISO 4217, e.g. "USD", "AED". */
  @Column({ length: 10, nullable: true })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.plans)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => Plan, (plan) => plan.tenantPlans)
  @JoinColumn({ name: 'planId' })
  plan: Plan;
}
