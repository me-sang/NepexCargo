import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { RateCardType, WeightUnit } from '../../common/enums/rate.enums';
import { Tenant } from './tenant.entity';
import { Zone } from './zone.entity';
import { Integration } from './integration.entity';
import { WeightTier } from './weight-tier.entity';

@Entity('rate_cards')
@Index(['tenantId'])
@Index(['tenantId', 'active'])
export class RateCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ length: 255, nullable: true })
  name: string;

  /** zone — rate defined by origin/destination zone pair. route — rate defined by specific country/city pair. */
  @Column({ type: 'varchar', length: 20, enum: RateCardType })
  type: RateCardType;

  // ── Zone-based fields (type = zone) ──────────────────────────────────────────

  @Column({ type: 'uuid', nullable: true })
  originZoneId: string | null;

  @Column({ type: 'uuid', nullable: true })
  destinationZoneId: string | null;

  // ── Route-based fields (type = route) ─────────────────────────────────────────

  @Column({ length: 2, nullable: true })
  originCountry: string | null;

  @Column({ length: 255, nullable: true })
  originCity: string | null;

  @Column({ length: 2, nullable: true })
  destinationCountry: string | null;

  @Column({ length: 255, nullable: true })
  destinationCity: string | null;

  // ── Shared fields ──────────────────────────────────────────────────────────────

  /** Optional link to a carrier integration in tenant_configurations. */
  @Column({ type: 'uuid', nullable: true })
  integrationId: string | null;

  /** ISO 4217 currency code, e.g. "USD", "AED". */
  @Column({ length: 3, default: 'USD' })
  currency: string;

  /** Unit shared across all weight tiers on this card — kg, g, lb, oz. */
  @Column({ type: 'varchar', length: 5, enum: WeightUnit, default: WeightUnit.KG })
  weightUnit: WeightUnit;

  @Column({ default: true })
  active: boolean;

  // ── Relations ──────────────────────────────────────────────────────────────────

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => Zone, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'originZoneId' })
  originZone: Zone | null;

  @ManyToOne(() => Zone, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'destinationZoneId' })
  destinationZone: Zone | null;

  @ManyToOne(() => Integration, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'integrationId' })
  integration: Integration | null;

  @OneToMany(() => WeightTier, (tier) => tier.rateCard, { cascade: true })
  weightTiers: WeightTier[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
