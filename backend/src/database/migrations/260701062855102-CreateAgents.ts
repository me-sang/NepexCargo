import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateAgents260701062855102 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'agents',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'tenantId', type: 'uuid' },
          { name: 'userId', type: 'uuid', isUnique: true },
          { name: 'accountType', type: 'varchar', length: '20', default: "'regular'" },
          { name: 'creditLimit', type: 'numeric', precision: 18, scale: 2, isNullable: true },
          { name: 'walletBalance', type: 'numeric', precision: 18, scale: 2, default: 0 },
          { name: 'scopeRegions', type: 'jsonb', default: "'[]'" },
          { name: 'scopeServiceTypes', type: 'jsonb', default: "'[]'" },
          { name: 'active', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        indices: [
          new TableIndex({ columnNames: ['tenantId'] }),
          new TableIndex({ columnNames: ['userId'], isUnique: true }),
          new TableIndex({ columnNames: ['tenantId', 'active'] }),
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'agents',
      new TableForeignKey({ columnNames: ['tenantId'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );
    await queryRunner.createForeignKey(
      'agents',
      new TableForeignKey({ columnNames: ['userId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('agents');
    if (table) await queryRunner.dropForeignKeys('agents', table.foreignKeys);
    await queryRunner.dropTable('agents');
  }
}
