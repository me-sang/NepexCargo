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
import { Tenant } from './tenant.entity';

@Entity('zones')
@Index(['tenantId'])
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  /** ISO 3166-1 alpha-2 country codes this zone is designated for, e.g. ["NP", "IN"]. Optional. */
  @Column({ type: 'jsonb', nullable: true, default: null })
  zoneFor?: string[];

  /** ISO 3166-1 alpha-2 country codes covered by this zone, e.g. ["NP", "IN"]. */
  @Column({ type: 'jsonb', default: '[]' })
  countries: string[];

  /** Optional city-level granularity within the countries list. */
  @Column({ type: 'jsonb', default: '[]' })
  cities: string[];

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
