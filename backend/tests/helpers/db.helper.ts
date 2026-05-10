import { AppDataSource } from '../../src/database/data-source';

export async function truncateTable(tableName: string): Promise<void> {
  await AppDataSource.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
}

export async function truncateAll(tables: string[]): Promise<void> {
  await Promise.all(tables.map(truncateTable));
}
