import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateRateCards260630075811289 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rate_cards',
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
            isNullable: true,
          },
          {
            // zone | route
            name: 'type',
            type: 'varchar',
            length: '20',
          },
          {
            // zone-based: FK to zones (origin)
            name: 'originZoneId',
            type: 'uuid',
            isNullable: true,
          },
          {
            // zone-based: FK to zones (destination)
            name: 'destinationZoneId',
            type: 'uuid',
            isNullable: true,
          },
          {
            // route-based: ISO 3166-1 alpha-2
            name: 'originCountry',
            type: 'varchar',
            length: '2',
            isNullable: true,
          },
          {
            name: 'originCity',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            // route-based: ISO 3166-1 alpha-2
            name: 'destinationCountry',
            type: 'varchar',
            length: '2',
            isNullable: true,
          },
          {
            name: 'destinationCity',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            // Optional FK to tenant_configurations (carrier integration).
            name: 'integrationId',
            type: 'uuid',
            isNullable: true,
          },
          {
            // ISO 4217, e.g. "USD".
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
          },
          {
            // kg | g | lb | oz | t
            name: 'weightUnit',
            type: 'varchar',
            length: '5',
            default: "'kg'",
          },
          {
            name: 'active',
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
        indices: [
          new TableIndex({ columnNames: ['tenantId'] }),
          new TableIndex({ columnNames: ['tenantId', 'active'] }),
        ],
      }),
      true,
    );

    // rate_cards → tenants
    await queryRunner.createForeignKey(
      'rate_cards',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // rate_cards → zones (origin)
    await queryRunner.createForeignKey(
      'rate_cards',
      new TableForeignKey({
        columnNames: ['originZoneId'],
        referencedTableName: 'zones',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // rate_cards → zones (destination)
    await queryRunner.createForeignKey(
      'rate_cards',
      new TableForeignKey({
        columnNames: ['destinationZoneId'],
        referencedTableName: 'zones',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // rate_cards → tenant_configurations (carrier integration)
    await queryRunner.createForeignKey(
      'rate_cards',
      new TableForeignKey({
        columnNames: ['integrationId'],
        referencedTableName: 'tenant_configurations',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('rate_cards');
    if (table) await queryRunner.dropForeignKeys('rate_cards', table.foreignKeys);
    await queryRunner.dropTable('rate_cards');
  }
}
