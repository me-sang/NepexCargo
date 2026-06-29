import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateUsersRolesPermissions1715000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create permissions table
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
          },
          {
            name: 'category',
            type: 'varchar',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create roles table
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'firstName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'lastName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'active'",
          },
          {
            name: 'lastLoginAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({ columnNames: ['email'] }),
          new TableIndex({ columnNames: ['status'] }),
        ],
      }),
      true,
    );

    // Create role_permissions junction table
    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          {
            name: 'roleId',
            type: 'uuid',
          },
          {
            name: 'permissionId',
            type: 'uuid',
          },
        ],
        indices: [
          new TableIndex({ columnNames: ['roleId'] }),
          new TableIndex({ columnNames: ['permissionId'] }),
          new TableIndex({ columnNames: ['roleId', 'permissionId'], isUnique: true }),
        ],
      }),
      true,
    );

    // Create user_roles junction table
    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'roleId',
            type: 'uuid',
          },
        ],
        indices: [
          new TableIndex({ columnNames: ['userId'] }),
          new TableIndex({ columnNames: ['roleId'] }),
          new TableIndex({ columnNames: ['userId', 'roleId'], isUnique: true }),
        ],
      }),
      true,
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['roleId'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['permissionId'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['roleId'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const userRolesTable = await queryRunner.getTable('user_roles');
    const userRolesForeignKeys = userRolesTable.foreignKeys;
    await queryRunner.dropForeignKeys('user_roles', userRolesForeignKeys);

    const rolePermissionsTable = await queryRunner.getTable('role_permissions');
    const rolePermissionsForeignKeys = rolePermissionsTable.foreignKeys;
    await queryRunner.dropForeignKeys('role_permissions', rolePermissionsForeignKeys);

    // Drop tables
    await queryRunner.dropTable('user_roles');
    await queryRunner.dropTable('role_permissions');
    await queryRunner.dropTable('users');
    await queryRunner.dropTable('roles');
    await queryRunner.dropTable('permissions');
  }
}
