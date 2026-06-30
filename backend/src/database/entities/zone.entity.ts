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
import { ZoneFor } from '../../common/enums/rate.enums';
import { Tenant } from './tenant.entity';

@Entity('zones')
@Index(['tenantId'])
@Index(['tenantId', 'zoneFor'])
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  /**
   * Whether this zone is used as a shipment origin, destination, or either.
   * Enforced at validation: origin-type rate cards may only reference ORIGIN/BOTH zones;
   * destination-type rate cards may only reference DESTINATION/BOTH zones.
   */
  @Column({ type: 'varchar', nullable: true, length: 20, enum: ZoneFor })
  zoneFor?: ZoneFor;

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
