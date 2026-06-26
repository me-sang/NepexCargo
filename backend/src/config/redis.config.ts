import { createClient, type RedisClientType } from 'redis';
import { env } from './env.config';

export const redisClient: RedisClientType = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
  password: env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => console.error('Redis client error', err));

export const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
};
