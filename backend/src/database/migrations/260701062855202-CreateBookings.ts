import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateBookings260701062855202 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            // Owning tenant
            name: 'tenantId',
            type: 'uuid',
          },
          {
            // Unique tracking / airway bill number — system-generated
            name: 'airwayBillNumber',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            // How this booking was created: manual | bulk_import | quote_request
            name: 'source',
            type: 'varchar',
            length: '30',
          },
          {
            // Portal user who created the booking; null when agent-created
            name: 'createdByUserId',
            type: 'uuid',
            isNullable: true,
          },
          {
            // Agent who created the booking; null when user-created
            name: 'createdByAgentId',
            type: 'uuid',
            isNullable: true,
          },
          {
            // Rate card used for pricing; null for manually priced bookings
            name: 'rateCardId',
            type: 'uuid',
            isNullable: true,
          },
          {
            // Courier integration (e.g. EMX) assigned to fulfil this booking
            name: 'integrationId',
            type: 'uuid',
            isNullable: true,
          },
          {
            // Sender contact + address as JSONB: { name, email, phone, addressLine1, addressLine2?, city, state?, zip?, country }
            name: 'sender',
            type: 'jsonb',
          },
          {
            // Receiver contact + address — same shape as sender
            name: 'receiver',
            type: 'jsonb',
          },
          {
            // Array of parcels: [{ weight, weightUnit, dimensions: { length, width, height, dimensionUnit }, additionalService?, remarks?, approxItemValue }]
            name: 'shipmentDetails',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            // Protection tier: free | opt_out | insured
            name: 'protectionType',
            type: 'varchar',
            length: '20',
            default: "'free'",
          },
          {
            // Declared value for insured protection; null for free / opt_out
            name: 'protectionValue',
            type: 'numeric',
            precision: 18,
            scale: 2,
            isNullable: true,
          },
          {
            // Booking lifecycle: draft | confirmed | in_transit | out_for_delivery | delivered | returned | cancelled
            name: 'status',
            type: 'varchar',
            length: '30',
            default: "'draft'",
          },
          {
            // Base shipping charge from rate card; null until priced
            name: 'shippingCost',
            type: 'numeric',
            precision: 18,
            scale: 2,
            isNullable: true,
          },
          {
            // Insurance / protection premium; 0 for free tier
            name: 'protectionCost',
            type: 'numeric',
            precision: 18,
            scale: 2,
            default: 0,
          },
          {
            // Tax applied to the shipment
            name: 'tax',
            type: 'numeric',
            precision: 18,
            scale: 2,
            default: 0,
          },
          {
            // Grand total (shippingCost + protectionCost + tax); null until priced
            name: 'total',
            type: 'numeric',
            precision: 18,
            scale: 2,
            isNullable: true,
          },
          {
            // ISO 4217 currency code for all financial columns
            name: 'currency',
            type: 'varchar',
            length: '10',
            default: "'NPR'",
          },
          {
            // Optional internal note added by staff
            name: 'notes',
            type: 'text',
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
        indices: [
          new TableIndex({ columnNames: ['tenantId'] }),
          new TableIndex({ columnNames: ['tenantId', 'status'] }),
          new TableIndex({ columnNames: ['airwayBillNumber'], isUnique: true }),
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({ columnNames: ['tenantId'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );
    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({ columnNames: ['createdByUserId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
    );
    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({ columnNames: ['createdByAgentId'], referencedTableName: 'agents', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
    );
    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({ columnNames: ['rateCardId'], referencedTableName: 'rate_cards', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
    );
    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({ columnNames: ['integrationId'], referencedTableName: 'integrations', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('bookings');
    if (table) await queryRunner.dropForeignKeys('bookings', table.foreignKeys);
    await queryRunner.dropTable('bookings');
  }
}
