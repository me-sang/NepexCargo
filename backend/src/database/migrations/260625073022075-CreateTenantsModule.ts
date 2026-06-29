import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateTenantsModule260625073022075 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── tenants ──────────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'tenants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            // Short internal identifier, e.g. "NEPEX-001".
            name: 'code',
            type: 'varchar',
            length: '30',
            isUnique: true,
          },
          {
            // URL-safe identifier used in subdomains and routes, e.g. "nepex-cargo".
            name: 'slug',
            type: 'varchar',
            length: '150',
            isUnique: true,
          },
          {
            name: 'legalName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'displayName',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            // ISO 4217 default display currency for the tenant.
            name: 'currency',
            type: 'varchar',
            length: '10',
            default: "'USD'",
          },
          {
            // active | inactive | suspended
            name: 'status',
            type: 'varchar',
            length: '30',
            default: "'active'",
          },
          {
            // regular (prepaid wallet) | credit (postpaid limit)
            name: 'accountType',
            type: 'varchar',
            length: '30',
            default: "'regular'",
          },
          {
            // Prepaid wallet balance; reduced on each transaction.
            name: 'walletBalance',
            type: 'numeric',
            precision: 18,
            scale: 2,
            default: 0,
          },
          {
            name: 'isVerified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'onboardingCompleted',
            type: 'boolean',
            default: false,
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
          {
            // Soft-delete timestamp; null = not deleted.
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        indices: [
          new TableIndex({ columnNames: ['slug'], isUnique: true }),
          new TableIndex({ columnNames: ['code'], isUnique: true }),
          new TableIndex({ columnNames: ['status'] }),
        ],
      }),
      true,
    );

    // ── tenant_plans ─────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'tenant_plans',
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
            name: 'planId',
            type: 'uuid',
          },
          {
            name: 'startsAt',
            type: 'timestamp',
          },
          {
            // null = open-ended subscription.
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            // monthly | yearly | custom
            name: 'renewalType',
            type: 'varchar',
            length: '30',
            isNullable: true,
          },
          {
            // trial | active | expired | cancelled | paused
            name: 'status',
            type: 'varchar',
            length: '30',
            isNullable: true,
          },
          {
            name: 'autoRenew',
            type: 'boolean',
            default: true,
          },
          {
            // Number of billing periods per renewal cycle.
            name: 'billingCycle',
            type: 'integer',
            default: 1,
          },
          {
            // Actual amount charged at subscription time.
            name: 'amount',
            type: 'numeric',
            precision: 18,
            scale: 2,
            isNullable: true,
          },
          {
            // ISO 4217 currency of the charged amount.
            name: 'currency',
            type: 'varchar',
            length: '10',
            isNullable: true,
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

    // ── tenant_settings ──────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'tenant_settings',
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
            // branding | payment | shipment | notifications | other
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            // Setting key, e.g. "logo", "colors", "gateways".
            name: 'key',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            // JSONB payload; shape depends on category + key.
            name: 'value',
            type: 'jsonb',
            isNullable: true,
          },
          {
            // True when value must be decrypted before use.
            name: 'encrypted',
            type: 'boolean',
            default: false,
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
        uniques: [new TableUnique({ columnNames: ['tenantId', 'category', 'key'] })],
      }),
      true,
    );

    // ── tenant_domains ───────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'tenant_domains',
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
            name: 'domain',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            // subdomain | custom
            name: 'type',
            type: 'varchar',
            length: '30',
            isNullable: true,
          },
          {
            name: 'isPrimary',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sslEnabled',
            type: 'boolean',
            default: false,
          },
          {
            // pending | active | failed | expired
            name: 'sslStatus',
            type: 'varchar',
            length: '30',
            isNullable: true,
          },
          {
            // DNS TXT token the tenant must publish to prove domain ownership.
            name: 'verificationToken',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            // null = not yet verified.
            name: 'verifiedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ── tenant_configurations ────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'tenant_configurations',
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
            // payment | shipment | email | sms | other
            name: 'configType',
            type: 'varchar',
            length: '30',
          },
          {
            // DHL | FedEx | Aramex | Stripe | SendGrid | Twilio | etc.
            name: 'provider',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'displayName',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            // Provider API keys/secrets. Always encrypted at application layer.
            name: 'credentials',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'enabled',
            type: 'boolean',
            default: true,
          },
          {
            // true = sandbox/test mode; false = live/production mode.
            name: 'sandbox',
            type: 'boolean',
            default: false,
          },
          {
            // Lower number = higher priority when multiple providers of same type exist.
            name: 'priority',
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
        uniques: [new TableUnique({ columnNames: ['tenantId', 'configType', 'provider'] })],
      }),
      true,
    );

    // ── tenant_usage ─────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'tenant_usage',
        columns: [
          {
            // PK is also the FK to tenants — strict 1:1 relationship.
            name: 'tenantId',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'usersCount',
            type: 'integer',
            default: 0,
          },
          {
            name: 'customersCount',
            type: 'integer',
            default: 0,
          },
          {
            name: 'bookingsCount',
            type: 'integer',
            default: 0,
          },
          {
            name: 'shipmentsCount',
            type: 'integer',
            default: 0,
          },
          {
            name: 'storageUsedMb',
            type: 'bigint',
            default: 0,
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

    // ── foreign keys ─────────────────────────────────────────────────────────

    // tenant_plans → tenants
    await queryRunner.createForeignKey(
      'tenant_plans',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // tenant_plans → plans
    await queryRunner.createForeignKey(
      'tenant_plans',
      new TableForeignKey({
        columnNames: ['planId'],
        referencedTableName: 'plans',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // tenant_settings → tenants
    await queryRunner.createForeignKey(
      'tenant_settings',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // tenant_domains → tenants
    await queryRunner.createForeignKey(
      'tenant_domains',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // tenant_configurations → tenants
    await queryRunner.createForeignKey(
      'tenant_configurations',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // tenant_usage → tenants (PK is also FK)
    await queryRunner.createForeignKey(
      'tenant_usage',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first (leaf tables → parent tables)
    for (const tableName of [
      'tenant_usage',
      'tenant_configurations',
      'tenant_domains',
      'tenant_settings',
      'tenant_plans',
    ]) {
      const table = await queryRunner.getTable(tableName);
      await queryRunner.dropForeignKeys(tableName, table.foreignKeys);
    }

    // Drop tables in reverse creation order
    await queryRunner.dropTable('tenant_usage');
    await queryRunner.dropTable('tenant_configurations');
    await queryRunner.dropTable('tenant_domains');
    await queryRunner.dropTable('tenant_settings');
    await queryRunner.dropTable('tenant_plans');
    await queryRunner.dropTable('tenants');
  }
}
