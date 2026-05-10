import { DataSourceOptions } from 'typeorm';
import { env } from './env.config';

export const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/../database/entities/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
  subscribers: [__dirname + '/../database/subscribers/**/*{.ts,.js}'],
  synchronize: false,
  logging: env.NODE_ENV === 'development',
  migrationsRun: false,
  migrationsTableName: 'typeorm_migrations',
};
