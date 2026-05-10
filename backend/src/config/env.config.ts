import { cleanEnv, str, num, bool, makeValidator } from 'envalid';

const commaSeparated = makeValidator<string[]>((input) => input.split(',').map((s) => s.trim()));

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: num({ default: 3000 }),

  // Database
  DB_HOST: str(),
  DB_PORT: num({ default: 5432 }),
  DB_NAME: str(),
  DB_USER: str(),
  DB_PASSWORD: str(),
  DB_SSL: bool({ default: false }),

  // Redis
  REDIS_HOST: str({ default: 'localhost' }),
  REDIS_PORT: num({ default: 6379 }),
  REDIS_PASSWORD: str({ default: '' }),

  // Auth
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: '7d' }),

  // CORS
  CORS_ORIGINS: commaSeparated({ default: 'http://localhost:3000' }),

  // Storage
  STORAGE_DRIVER: str({ choices: ['local', 's3'], default: 'local' }),
  LOCAL_STORAGE_PATH: str({ default: './storage/uploads' }),
  AWS_ACCESS_KEY_ID: str({ default: '' }),
  AWS_SECRET_ACCESS_KEY: str({ default: '' }),
  AWS_REGION: str({ default: 'us-east-1' }),
  AWS_S3_BUCKET: str({ default: '' }),

  // Stripe
  STRIPE_SECRET_KEY: str({ default: '' }),
  STRIPE_WEBHOOK_SECRET: str({ default: '' }),

  // UPS
  UPS_CLIENT_ID: str({ default: '' }),
  UPS_CLIENT_SECRET: str({ default: '' }),
  UPS_ACCOUNT_NUMBER: str({ default: '' }),
  UPS_SANDBOX: bool({ default: true }),

  // FedEx
  FEDEX_API_KEY: str({ default: '' }),
  FEDEX_SECRET_KEY: str({ default: '' }),
  FEDEX_ACCOUNT_NUMBER: str({ default: '' }),
  FEDEX_SANDBOX: bool({ default: true }),

  // DHL
  DHL_API_KEY: str({ default: '' }),
  DHL_SANDBOX: bool({ default: true }),
});
