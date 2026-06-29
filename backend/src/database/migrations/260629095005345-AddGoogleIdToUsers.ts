import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddGoogleIdToUsers260629095005345 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({ name: 'googleId', type: 'varchar', isNullable: true }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_googleId',
        columnNames: ['googleId'],
        isUnique: true,
        where: '"googleId" IS NOT NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_googleId');
    await queryRunner.dropColumn('users', 'googleId');
  }
}
