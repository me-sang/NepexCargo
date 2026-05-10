import { Queue } from 'bullmq';
import { defaultQueueConfig, QueueName } from '../config/queue.config';

const queues = new Map<string, Queue>();

export function getQueue(name: QueueName): Queue {
  if (!queues.has(name)) {
    queues.set(name, new Queue(name, defaultQueueConfig));
  }
  return queues.get(name)!;
}

export async function closeAllQueues(): Promise<void> {
  await Promise.all([...queues.values()].map((q) => q.close()));
  queues.clear();
}
