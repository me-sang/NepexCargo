import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { RateCard } from './rate-card.entity';

@Entity('weight_tiers')
@Index(['rateCardId'])
export class WeightTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  rateCardId: string;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  minWeight: number;

  /** null = open upper bound ("and above"). */
  @Column({ type: 'numeric', precision: 10, scale: 3, nullable: true })
  maxWeight: number | null;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  pricePerUnit: number;

  /** Optional flat surcharge added on top of per-unit price. */
  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  flatPrice: number | null;

  @ManyToOne(() => RateCard, (card) => card.weightTiers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rateCardId' })
  rateCard: RateCard;
}
