import { Entity, PrimaryColumn, Column, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_usage')
export class TenantUsage {
  /** Same as tenant.id — this table has a 1:1 PK/FK relationship with tenants. */
  @PrimaryColumn({ type: 'uuid' })
  tenantId: string;

  /** Cached count of active users belonging to this tenant. */
  @Column({ default: 0 })
  usersCount: number;

  /** Cached count of customers created under this tenant. */
  @Column({ default: 0 })
  customersCount: number;

  /** Cached count of bookings made under this tenant. */
  @Column({ default: 0 })
  bookingsCount: number;

  /** Cached count of shipments processed under this tenant. */
  @Column({ default: 0 })
  shipmentsCount: number;

  /** Total storage consumed in megabytes (files, documents, etc.). */
  @Column({ type: 'bigint', default: 0 })
  storageUsedMb: number;

  /** Last time any counter was updated; use to detect stale cache. */
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Tenant, (tenant) => tenant.usage)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
