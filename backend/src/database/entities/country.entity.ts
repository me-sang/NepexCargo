import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Full country name, e.g. "United Arab Emirates". */
  @Column({ length: 100 })
  name: string;

  /** ISO 3166-1 alpha-2 code, e.g. "AE". Used in shipping integrations. */
  @Index({ unique: true })
  @Column({ length: 2 })
  iso2: string;

  /** ISO 3166-1 alpha-3 code, e.g. "ARE". */
  @Column({ length: 3, nullable: true })
  iso3: string;

  /** ISO 3166-1 numeric code, e.g. "784". Stored as string to preserve leading zeros. */
  @Column({ length: 3, nullable: true })
  numeric: string;

  /** International dial prefix, e.g. "+971". */
  @Column({ length: 15, nullable: true })
  phoneCode: string;

  /** Default ISO 4217 currency for this country, e.g. "AED". */
  @Column({ length: 10, nullable: true })
  currency: string;

  /** Whether this country is available for selection in the platform. */
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
