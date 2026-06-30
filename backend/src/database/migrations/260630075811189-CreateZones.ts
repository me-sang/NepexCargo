import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateZones260630075811189 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'zones',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenantId',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            // ISO 3166-1 alpha-2 codes this zone is designated for, e.g. ["NP","IN"].
            name: 'zoneFor',
            type: 'jsonb',
            isNullable: true,
            default: null,
          },
          {
            // ISO 3166-1 alpha-2 country codes covered by this zone.
            name: 'countries',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            // Optional city-level granularity within the countries list.
            name: 'cities',
            type: 'jsonb',
            default: "'[]'",
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
        indices: [new TableIndex({ columnNames: ['tenantId'] })],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'zones',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('zones');
    if (table) await queryRunner.dropForeignKeys('zones', table.foreignKeys);
    await queryRunner.dropTable('zones');
  }
}
