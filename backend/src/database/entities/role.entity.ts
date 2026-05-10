import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';

@Entity('roles')
@Index(['name'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., 'admin', 'manager', 'user'

  @Column()
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
