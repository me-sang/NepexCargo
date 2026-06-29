import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TenantAccountType, TenantStatus } from '../../common/enums/tenant.enums';
import { TenantPlan } from './tenant-plan.entity';
import { TenantSetting } from './tenant-setting.entity';
import { TenantDomain } from './tenant-domain.entity';
import { TenantConfiguration } from './tenant-configuration.entity';
import { TenantUsage } from './tenant-usage.entity';

@Entity('tenants')
@Index(['slug'], { unique: true })
@Index(['code'], { unique: true })
@Index(['status'])
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Short internal identifier, e.g. "NEPEX-001". */
  @Column({ length: 30, unique: true })
  code: string;

  /** URL-safe identifier used in subdomains and routes, e.g. "nepex-cargo". */
  @Column({ length: 150, unique: true })
  slug: string;

  /** Registered legal company name. */
  @Column({ length: 255 })
  legalName: string;

  /** Brand name shown in the UI, may differ from legalName. */
  @Column({ length: 255, nullable: true })
  displayName: string;

  /** Primary contact email for the tenant organisation. */
  @Column({ length: 255, nullable: true })
  email: string;

  /** Primary contact phone number. */
  @Column({ length: 50, nullable: true })
  phone: string;

  /** Default display currency for the tenant, ISO 4217, e.g. "USD", "AED". */
  @Column({ length: 10, default: 'USD' })
  currency: string;

  /** Lifecycle state — active | inactive | suspended. */
  @Column({ type: 'varchar', length: 30, default: TenantStatus.ACTIVE, enum: TenantStatus })
  status: TenantStatus;

  /** Billing model — regular (prepaid wallet) | credit (postpaid limit). */
  @Column({
    type: 'varchar',
    length: 30,
    default: TenantAccountType.REGULAR,
    enum: TenantAccountType,
  })
  accountType: TenantAccountType;

  /** Prepaid wallet balance; reduced on each transaction. */
  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  walletBalance: number;

  /** Whether KYC / identity verification has been completed. */
  @Column({ default: false })
  isVerified: boolean;

  /** Whether the tenant has finished the initial onboarding flow. */
  @Column({ default: false })
  onboardingCompleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /** Set when the tenant is soft-deleted; null means not deleted. */
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @OneToMany(() => TenantPlan, (plan) => plan.tenant)
  plans: TenantPlan[];

  @OneToMany(() => TenantSetting, (setting) => setting.tenant)
  settings: TenantSetting[];

  @OneToMany(() => TenantDomain, (domain) => domain.tenant)
  domains: TenantDomain[];

  @OneToMany(() => TenantConfiguration, (config) => config.tenant)
  configurations: TenantConfiguration[];

  @OneToOne(() => TenantUsage, (usage) => usage.tenant)
  usage: TenantUsage;
}
