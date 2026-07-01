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
import { BookingSource, BookingStatus, ProtectionType } from '../../common/enums/booking.enums';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
import { Agent } from './agent.entity';
import { RateCard } from './rate-card.entity';
import { Integration } from './integration.entity';

// ── JSONB Shape Interfaces ─────────────────────────────────────────────────────

/** Contact and address info stored as JSONB — used for both sender and receiver. */
export interface ContactAddress {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  /** State / province — optional for countries that don't use it. */
  state?: string;
  /** Postal / ZIP code. */
  zip?: string;
  /** ISO 3166-1 alpha-2 country code, e.g. "NP". */
  country: string;
}

/** Physical dimensions of a single parcel. */
export interface ParcelDimensions {
  length: number;
  width: number;
  height: number;
  /** Unit of the dimension values — centimetres or inches. */
  dimensionUnit: 'cm' | 'in';
}

/** One shipment item in the shipmentDetails array. */
export interface ShipmentItem {
  /** Declared weight of the parcel. */
  weight: number;
  /** Unit of the weight value. */
  weightUnit: 'kg' | 'g' | 'lb' | 'oz' | 't';
  dimensions: ParcelDimensions;
  /** Any special handling or value-added service requested, e.g. "fragile", "signature". */
  additionalService?: string;
  /** Free-text note from the customer about this parcel. */
  remarks?: string;
  /** Approximate declared value of the contents in the booking currency. */
  approxItemValue: number;
}

// ── Entity ─────────────────────────────────────────────────────────────────────

@Entity('bookings')
@Index(['tenantId'])
@Index(['tenantId', 'status'])
@Index(['airwayBillNumber'], { unique: true })
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Owning tenant. */
  @Column({ type: 'uuid' })
  tenantId: string;

  /** System-generated airway bill / tracking number. Unique across all tenants. */
  @Column({ length: 100, unique: true })
  airwayBillNumber: string;

  /** How the booking entered the system — manual entry, bulk CSV import, or quote acceptance. */
  @Column({ type: 'varchar', length: 30, enum: BookingSource })
  source: BookingSource;

  /** Portal user who created the booking; null when created by an agent. */
  @Column({ type: 'uuid', nullable: true })
  createdByUserId: string | null;

  /** Agent who created the booking; null when created by a portal user. */
  @Column({ type: 'uuid', nullable: true })
  createdByAgentId: string | null;

  /** Rate card used to price this shipment; null when priced manually. */
  @Column({ type: 'uuid', nullable: true })
  rateCardId: string | null;

  /** Courier integration (e.g. EMX) assigned to fulfil this booking. */
  @Column({ type: 'uuid', nullable: true })
  integrationId: string | null;

  // ── Sender ─────────────────────────────────────────────────────────────────

  /** Sender's contact and address details. */
  @Column({ type: 'jsonb' })
  sender: ContactAddress;

  // ── Receiver ───────────────────────────────────────────────────────────────

  /** Recipient's contact and address details. */
  @Column({ type: 'jsonb' })
  receiver: ContactAddress;

  // ── Shipment items ─────────────────────────────────────────────────────────

  /** Array of parcels in this booking, each with weight, dimensions, and declared value. */
  @Column({ type: 'jsonb', default: '[]' })
  shipmentDetails: ShipmentItem[];

  // ── Protection ─────────────────────────────────────────────────────────────

  /** Shipment protection / insurance tier selected by the customer. */
  @Column({ type: 'varchar', length: 20, default: ProtectionType.FREE, enum: ProtectionType })
  protectionType: ProtectionType;

  /** Declared value used to compute insured protection cost; null for free / opt-out tiers. */
  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  protectionValue: number | null;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /** Current booking lifecycle state. */
  @Column({ type: 'varchar', length: 30, default: BookingStatus.DRAFT, enum: BookingStatus })
  status: BookingStatus;

  // ── Financials ─────────────────────────────────────────────────────────────

  /** Base shipping charge calculated from the rate card. */
  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  shippingCost: number | null;

  /** Protection / insurance premium; 0 for free tier. */
  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  protectionCost: number;

  /** Tax applied to the shipment. */
  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  tax: number;

  /** Grand total (shippingCost + protectionCost + tax). */
  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  total: number | null;

  /** ISO 4217 currency code for all financial columns, e.g. "NPR", "AED". */
  @Column({ length: 10, default: 'NPR' })
  currency: string;

  /** Optional internal note added by staff. */
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // ── Relations ──────────────────────────────────────────────────────────────

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: User | null;

  @ManyToOne(() => Agent, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByAgentId' })
  createdByAgent: Agent | null;

  @ManyToOne(() => RateCard, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'rateCardId' })
  rateCard: RateCard | null;

  @ManyToOne(() => Integration, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'integrationId' })
  integration: Integration | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
