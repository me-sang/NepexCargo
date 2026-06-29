import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddTenantAndPasswordResetToUsers260628120000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({ name: 'tenantId', type: 'uuid', isNullable: true }),
      new TableColumn({ name: 'otpHash', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'otpExpiresAt', type: 'timestamp', isNullable: true }),
      new TableColumn({ name: 'resetTokenHash', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'resetTokenExpiresAt', type: 'timestamp', isNullable: true }),
    ]);

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({ name: 'IDX_users_resetTokenHash', columnNames: ['resetTokenHash'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');

    const fk = table!.foreignKeys.find((f) => f.columnNames.includes('tenantId'));
    if (fk) await queryRunner.dropForeignKey('users', fk);

    await queryRunner.dropIndex('users', 'IDX_users_resetTokenHash');

    await queryRunner.dropColumns('users', [
      'tenantId',
      'otpHash',
      'otpExpiresAt',
      'resetTokenHash',
      'resetTokenExpiresAt',
    ]);
  }
}
