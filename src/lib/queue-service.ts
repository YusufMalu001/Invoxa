import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

let connection: IORedis | null = null;

try {
  if (process.env.REDIS_URL) {
    connection = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
} catch (e) {
  console.warn('Redis not available, queue disabled');
}

export const QUEUES = {
  AI_PROCESSING: 'ai-processing',
  EMAIL_NOTIFICATIONS: 'email-notifications',
  RECURRING_WORKFLOWS: 'recurring-workflows',
};

class QueueService {
  private queues: Map<string, Queue> = new Map();

  constructor() {
    this.initQueues();
  }

  private initQueues() {
    if (!connection) return;
    Object.values(QUEUES).forEach(queueName => {
      this.queues.set(queueName, new Queue(queueName, { connection: connection as any }));
    });
  }

  public getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  public async addJob(queueName: string, jobName: string, data: any, opts?: any) {
    const queue = this.getQueue(queueName);
    if (!queue) {
      console.warn(`Queue ${queueName} not found or Redis disabled`);
      return null;
    }
    return queue.add(jobName, data, opts);
  }
}

export const queueService = new QueueService();

// Helper to create workers (to be used in a separate worker process or a custom server)
export function createWorker(queueName: string, processor: (job: Job) => Promise<any>) {
  return new Worker(queueName, processor, { connection: connection as any });
}
