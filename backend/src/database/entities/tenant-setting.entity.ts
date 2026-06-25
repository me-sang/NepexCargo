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
import { TenantSettingCategory } from '../../common/enums/tenant.enums';
import { Tenant } from './tenant.entity';

@Entity('tenant_settings')
@Unique(['tenantId', 'category', 'key'])
export class TenantSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  /**
   * Logical group for this setting.
   * branding | payment | shipment | notifications | other
   */
  @Column({ type: 'varchar', length: 100, nullable: true, enum: TenantSettingCategory })
  category: TenantSettingCategory;

  /**
   * Setting key within the category, e.g. "logo", "colors", "gateways".
   * Combined with category forms a unique setting per tenant.
   */
  @Column({ length: 255, nullable: true })
  key: string;

  /** JSONB payload for the setting; shape depends on category + key. */
  @Column({ type: 'jsonb', nullable: true })
  value: unknown;

  /** True when the value is stored encrypted and must be decrypted before use. */
  @Column({ default: false })
  encrypted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.settings)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
