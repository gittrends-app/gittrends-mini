import { Job, Queue, QueueEvents, Worker } from 'bullmq';

const REDIS_HOST = process.env.CLI_REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.CLI_REDIS_PORT || 6379;
const REDIS_DB = process.env.CLI_REDIS_DB || 0;

type JobType = {
  id: string;
  name_with_owner: string;
  url?: string;
};

export async function withBullQueue<T>(callback: (queue: Queue<JobType>) => Promise<T>): Promise<T> {
  const queue = new Queue<JobType>('@gittrends/cli', {
    connection: { host: REDIS_HOST, port: REDIS_PORT, db: REDIS_DB },
    defaultJobOptions: { attempts: process.env.CLI_QUEUE_ATTEMPS || 1 },
  });

  return callback(queue).finally(() => queue.close());
}

export async function withBullEvents<T = any>(callback: (queue: QueueEvents) => Promise<T>): Promise<T> {
  const queue = new QueueEvents('@gittrends/cli', {
    connection: { host: REDIS_HOST, port: REDIS_PORT, db: REDIS_DB },
  });

  return callback(queue).finally(() => queue.close());
}

export async function withBullWorker(worker: (job: Job<JobType>) => Promise<void>, concurrency: number): Promise<void> {
  const queue = new Worker<JobType>('@gittrends/cli', worker, {
    connection: { host: REDIS_HOST, port: REDIS_PORT, db: REDIS_DB },
    maxStalledCount: Number.MAX_SAFE_INTEGER,
    concurrency,
    autorun: true,
  });

  return new Promise<void>((resolve, reject) => {
    queue.on('closed', resolve);
    queue.on('error', reject);
  }).finally(() => queue.close());
}
