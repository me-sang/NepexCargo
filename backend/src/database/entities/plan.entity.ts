import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PlanFeature } from './plan-feature.entity';
import { TenantPlan } from './tenant-plan.entity';

/** Billing period options available for a plan. */
export enum PlanBillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export interface PlanBillingOption {
  /** Billing period for this price point. */
  billingCycle: PlanBillingCycle;
  /** Listed price for this period. */
  price: number;
  /** ISO 4217 currency code, e.g. "USD", "AED". */
  currency: string;
}

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Short machine-readable identifier, e.g. "starter", "business", "enterprise". */
  @Column({ length: 50, unique: true })
  code!: string;

  /** Display name shown in pricing pages, e.g. "Business Plan". */
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  /**
   * All price points for this plan across billing cycles and currencies.
   * A single plan can have prices in multiple currencies without duplicating records.
   * e.g. [{ billingCycle: 'monthly', price: 29.99, currency: 'USD' }, ...]
   */
  @Column({ type: 'jsonb', default: '[]' })
  billingOptions!: PlanBillingOption[];

  /** Whether this plan is listed publicly in the pricing page. */
  @Column({ default: true })
  isPublic!: boolean;

  /** Whether this plan is available for new subscriptions. */
  @Column({ default: true })
  isActive!: boolean;

  /** Display ordering on the pricing page; lower = shown first. */
  @Column({ default: 0 })
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => PlanFeature, (feature) => feature.plan)
  features!: PlanFeature[];

  @OneToMany(() => TenantPlan, (tenantPlan) => tenantPlan.plan)
  tenantPlans!: TenantPlan[];
}
