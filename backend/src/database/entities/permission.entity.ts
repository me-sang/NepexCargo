import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, Index } from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
@Index(['name'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., 'create:shipments', 'read:users', 'delete:reports'

  @Column()
  description: string;

  @Column()
  category: string; // e.g., 'shipments', 'users', 'reports'

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;
}
