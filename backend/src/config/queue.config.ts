import { QueueOptions } from 'bullmq';
import { redisConfig } from './redis.config';

export const defaultQueueConfig: QueueOptions = {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
};

export const QUEUE_NAMES = {
  EMAIL: 'email',
  NOTIFICATION: 'notification',
  SHIPMENT: 'shipment',
  PAYMENT: 'payment',
  REPORT: 'report',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
