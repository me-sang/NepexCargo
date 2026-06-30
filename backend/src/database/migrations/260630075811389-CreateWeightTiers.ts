import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateWeightTiers260630075811389 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'weight_tiers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'rateCardId',
            type: 'uuid',
          },
          {
            name: 'minWeight',
            type: 'numeric',
            precision: 10,
            scale: 3,
          },
          {
            // null = open upper bound ("and above").
            name: 'maxWeight',
            type: 'numeric',
            precision: 10,
            scale: 3,
            isNullable: true,
          },
          {
            name: 'pricePerUnit',
            type: 'numeric',
            precision: 18,
            scale: 2,
          },
          {
            // Optional flat surcharge added on top of per-unit price.
            name: 'flatPrice',
            type: 'numeric',
            precision: 18,
            scale: 2,
            isNullable: true,
          },
        ],
        indices: [new TableIndex({ columnNames: ['rateCardId'] })],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'weight_tiers',
      new TableForeignKey({
        columnNames: ['rateCardId'],
        referencedTableName: 'rate_cards',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('weight_tiers');
    if (table) await queryRunner.dropForeignKeys('weight_tiers', table.foreignKeys);
    await queryRunner.dropTable('weight_tiers');
  }
}
