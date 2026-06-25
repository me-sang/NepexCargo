import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { TenantDomainSslStatus, TenantDomainType } from '../../common/enums/tenant.enums';
import { Tenant } from './tenant.entity';

@Entity('tenant_domains')
@Unique(['domain'])
export class TenantDomain {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  /** Fully qualified domain name, e.g. "ship.partner.com". */
  @Column({ length: 255 })
  domain: string;

  /** subdomain — platform-assigned; custom — tenant-owned domain. */
  @Column({ type: 'varchar', length: 30, nullable: true, enum: TenantDomainType })
  type: TenantDomainType;

  /** Whether this is the tenant's main domain (only one per tenant should be true). */
  @Column({ default: false })
  isPrimary: boolean;

  /** Whether HTTPS/SSL has been provisioned for this domain. */
  @Column({ default: false })
  sslEnabled: boolean;

  /** SSL certificate state — pending | active | failed | expired. */
  @Column({ type: 'varchar', length: 30, nullable: true, enum: TenantDomainSslStatus })
  sslStatus: TenantDomainSslStatus;

  /** Token the tenant must publish (DNS TXT record) to prove domain ownership. */
  @Column({ length: 255, nullable: true })
  verificationToken: string;

  /** Timestamp when domain ownership was confirmed; null = unverified. */
  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.domains)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
