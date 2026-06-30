import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Plan } from './plan.entity';

/** Data type of the feature value, used to interpret featureValue correctly. */
export enum PlanFeatureType {
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  STRING = 'string',
  LIST = 'list',
}

/** All supported feature keys. Used by limit-check logic at runtime. */
export enum PlanFeatureKey {
  MAX_USERS = 'max_users',
  MAX_SHIPMENTS_PER_MONTH = 'max_shipments_per_month',
  CUSTOM_DOMAIN = 'custom_domain',
  API_ACCESS = 'api_access',
  SUPPORT_TIER = 'support_tier',
  ALLOWED_CARRIERS = 'allowed_carriers',
  SSO = 'sso',
  AUDIT_LOGS = 'audit_logs',
}

@Entity('plan_features')
export class PlanFeature {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  planId!: string;

  /**
   * Machine-readable feature identifier, e.g. "max_users", "custom_domain",
   * "allowed_shipment_providers". Used by limit-check logic at runtime.
   */
  @Column({ length: 100, nullable: true })
  featureKey!: string;

  /** Declares the type of featureValue so consumers know how to read it. */
  @Column({ type: 'varchar', length: 30, nullable: true, enum: PlanFeatureType })
  featureType!: PlanFeatureType;

  /**
   * The feature's value as JSONB. Interpret according to featureType:
   *   boolean → true / false
   *   number  → numeric limit (e.g. 500)
   *   string  → text value (e.g. "priority")
   *   list    → array of strings (e.g. ["DHL","FedEx"])
   */
  @Column({ type: 'jsonb', nullable: true })
  featureValue!: unknown;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Plan, (plan) => plan.features)
  @JoinColumn({ name: 'planId' })
  plan!: Plan;
}
