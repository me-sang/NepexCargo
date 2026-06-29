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
  BOOLEAN = 'boolean', // e.g. custom_domain: true
  NUMBER = 'number', // e.g. max_users: 500
  STRING = 'string', // e.g. support_tier: "priority"
  LIST = 'list', // e.g. allowed_countries: ["US", "AE"]
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
