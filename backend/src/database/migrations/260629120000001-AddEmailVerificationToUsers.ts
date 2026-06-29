import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddEmailVerificationToUsers260629120000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({ name: 'isEmailVerified', type: 'boolean', default: false }),
      new TableColumn({ name: 'emailVerifyTokenHash', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'emailVerifyTokenExpiresAt', type: 'timestamp', isNullable: true }),
      new TableColumn({ name: 'emailVerifyOtpHash', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'emailVerifyOtpExpiresAt', type: 'timestamp', isNullable: true }),
    ]);

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_emailVerifyTokenHash',
        columnNames: ['emailVerifyTokenHash'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_emailVerifyTokenHash');
    await queryRunner.dropColumns('users', [
      'isEmailVerified',
      'emailVerifyTokenHash',
      'emailVerifyTokenExpiresAt',
      'emailVerifyOtpHash',
      'emailVerifyOtpExpiresAt',
    ]);
  }
}
