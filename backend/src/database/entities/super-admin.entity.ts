import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SuperAdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('super_admins')
@Index(['email'], { unique: true })
export class SuperAdmin {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ length: 100, nullable: true })
  firstName!: string;

  @Column({ length: 100, nullable: true })
  lastName!: string;

  /** active | inactive | suspended */
  @Column({ type: 'varchar', length: 30, default: SuperAdminStatus.ACTIVE })
  status!: SuperAdminStatus;

  @Column({ nullable: true })
  lastLoginAt!: Date;

  /** varchar(45) covers both IPv4 and IPv6 addresses. */
  @Column({ length: 45, nullable: true })
  lastLoginIp!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
