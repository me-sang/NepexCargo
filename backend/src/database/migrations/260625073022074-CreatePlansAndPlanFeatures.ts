import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePlansAndPlanFeatures260625073022074 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── plans ────────────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'plans',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            // JSONB array of { billingCycle, price, currency } objects.
            // Supports multiple currencies/cycles per plan without extra rows.
            name: 'billingOptions',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'isPublic',
            type: 'boolean',
            default: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sortOrder',
            type: 'integer',
            default: 0,
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

    // ── plan_features ────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'plan_features',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'planId',
            type: 'uuid',
          },
          {
            // Machine-readable key, e.g. "max_users", "custom_domain".
            name: 'featureKey',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            // boolean | number | string | list — tells consumers how to read featureValue.
            name: 'featureType',
            type: 'varchar',
            length: '30',
            isNullable: true,
          },
          {
            name: 'featureValue',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({ columnNames: ['planId'] }),
        ],
      }),
      true,
    );

    // ── foreign keys ─────────────────────────────────────────────────────────
    await queryRunner.createForeignKey(
      'plan_features',
      new TableForeignKey({
        columnNames: ['planId'],
        referencedTableName: 'plans',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const planFeaturesTable = await queryRunner.getTable('plan_features');
    await queryRunner.dropForeignKeys('plan_features', planFeaturesTable!.foreignKeys);

    await queryRunner.dropTable('plan_features');
    await queryRunner.dropTable('plans');
  }
}
