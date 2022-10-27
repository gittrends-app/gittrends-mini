import { Job, Queue, QueueEvents, Worker } from 'bullmq';

const REDIS_HOST = process.env.CLI_REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.CLI_REDIS_PORT || '6379');
const REDIS_DB = parseInt(process.env.CLI_REDIS_DB || '0');

type JobType = {
  id: string;
  name_with_owner: string;
  url?: string;
};

export async function withBullQueue<T = any>(callback: (queue: Queue) => Promise<T>): Promise<T>;
export function withBullQueue(): Queue;
export function withBullQueue(callback?: any): any {
  const queue = new Queue<JobType>('@gittrends/cli', {
    connection: { host: REDIS_HOST, port: REDIS_PORT, db: REDIS_DB },
  });

  return callback ? callback(queue).finally(() => queue.close()) : queue;
}

export async function withBullEvents<T = any>(callback: (queue: QueueEvents) => Promise<T>): Promise<T>;
export function withBullEvents(): QueueEvents;
export function withBullEvents(callback?: any): any {
  const queue = new QueueEvents('@gittrends/cli', {
    connection: { host: REDIS_HOST, port: REDIS_PORT, db: REDIS_DB },
  });

  return callback ? callback(queue).finally(() => queue.close()) : queue;
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
