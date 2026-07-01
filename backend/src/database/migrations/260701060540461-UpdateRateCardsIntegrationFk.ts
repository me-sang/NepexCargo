import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class UpdateRateCardsIntegrationFk260701060540461 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old FK pointing to tenant_configurations
    const table = await queryRunner.getTable('rate_cards');
    const oldFk = table?.foreignKeys.find(
      (fk) =>
        fk.columnNames.includes('integrationId') && fk.referencedTableName === 'tenant_configurations',
    );
    if (oldFk) await queryRunner.dropForeignKey('rate_cards', oldFk);

    // Point integrationId at the new integrations table
    await queryRunner.createForeignKey(
      'rate_cards',
      new TableForeignKey({
        columnNames: ['integrationId'],
        referencedTableName: 'integrations',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('rate_cards');
    const fk = table?.foreignKeys.find(
      (fk) => fk.columnNames.includes('integrationId') && fk.referencedTableName === 'integrations',
    );
    if (fk) await queryRunner.dropForeignKey('rate_cards', fk);

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
}
