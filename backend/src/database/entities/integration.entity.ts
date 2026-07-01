import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IntegrationCategory, IntegrationStatus } from '../../common/enums/integration.enums';

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 30, enum: IntegrationCategory })
  category: IntegrationCategory;

  @Column({ type: 'varchar', length: 20, enum: IntegrationStatus, default: IntegrationStatus.ACTIVE })
  status: IntegrationStatus;

  @Column({ length: 2048, nullable: true })
  logoUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
