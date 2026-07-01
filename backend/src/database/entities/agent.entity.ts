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
import { AgentAccountType, AgentServiceType } from '../../common/enums/agent.enums';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';

@Entity('agents')
@Index(['tenantId'])
@Index(['userId'], { unique: true })
@Index(['tenantId', 'active'])
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 20, default: AgentAccountType.REGULAR, enum: AgentAccountType })
  accountType: AgentAccountType;

  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  creditLimit: number | null;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  walletBalance: number;

  @Column({ type: 'jsonb', default: '[]' })
  scopeRegions: string[];

  @Column({ type: 'jsonb', default: '[]' })
  scopeServiceTypes: AgentServiceType[];

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
