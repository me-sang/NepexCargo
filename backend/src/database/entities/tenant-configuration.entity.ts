import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { TenantConfigProvider, TenantConfigType } from '../../common/enums/tenant.enums';
import { Tenant } from './tenant.entity';

@Entity('tenant_configurations')
@Unique(['tenantId', 'configType', 'provider'])
export class TenantConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  /** Category of the external service — payment | shipment | email | sms | other. */
  @Column({ type: 'varchar', length: 30, enum: TenantConfigType })
  configType: TenantConfigType;

  /** External provider identifier, e.g. DHL, Stripe, SendGrid. */
  @Column({ type: 'varchar', length: 50 })
  provider: TenantConfigProvider;

  /** Human-readable label for this configuration, e.g. "DHL Production". */
  @Column({ length: 255, nullable: true })
  displayName: string;

  /** Provider API keys / secrets stored as encrypted JSONB. Never expose raw. */
  @Column({ type: 'jsonb', nullable: true })
  credentials: Record<string, unknown>;

  /** Whether this integration is currently active for the tenant. */
  @Column({ default: true })
  enabled: boolean;

  /** True = sandbox/test mode; False = live/production mode. */
  @Column({ default: false })
  sandbox: boolean;

  /** Lower number = higher priority when multiple providers of the same type exist. */
  @Column({ default: 0 })
  priority: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.configurations)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
