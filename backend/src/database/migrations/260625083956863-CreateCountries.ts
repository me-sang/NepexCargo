import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCountries260625083956863 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'countries',
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
            length: '100',
          },
          {
            // ISO 3166-1 alpha-2 code, e.g. "AE". Used in shipping integrations.
            name: 'iso2',
            type: 'varchar',
            length: '2',
            isUnique: true,
          },
          {
            // ISO 3166-1 alpha-3 code, e.g. "ARE".
            name: 'iso3',
            type: 'varchar',
            length: '3',
            isNullable: true,
          },
          {
            // ISO 3166-1 numeric code, e.g. "784". Stored as string to preserve leading zeros.
            name: 'numeric',
            type: 'varchar',
            length: '3',
            isNullable: true,
          },
          {
            // International dial prefix, e.g. "+971".
            name: 'phoneCode',
            type: 'varchar',
            length: '15',
            isNullable: true,
          },
          {
            // Default ISO 4217 currency for this country, e.g. "AED".
            name: 'currency',
            type: 'varchar',
            length: '10',
            isNullable: true,
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
        indices: [
          new TableIndex({ columnNames: ['iso2'], isUnique: true }),
          new TableIndex({ columnNames: ['isActive'] }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('countries');
  }
}
