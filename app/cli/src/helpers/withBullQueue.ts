import { Job, Queue, QueueEvents, Worker } from 'bullmq';

const REDIS_HOST = process.env.CLI_REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.CLI_REDIS_PORT || '6379');
const REDIS_DB = parseInt(process.env.CLI_REDIS_DB || '0');

export type CliJobType = {
  avatar_url?: string;
  database_id?: number;
  description?: string;
  forks?: number;
  id: string;
  issues?: number;
  name_with_owner: string;
  primary_language?: string;
  pull_requests?: number;
  releases?: number;
  stargazers?: number;
  url?: string;
  watchers?: number;

  __resources: string[];
  __updated_before: Date;
  __force?: boolean;
};

export async function withBullQueue<T = any>(callback: (queue: Queue<CliJobType>) => Promise<T>): Promise<T>;
export function withBullQueue(): Queue<CliJobType>;
export function withBullQueue(callback?: any): any {
  const queue = new Queue<CliJobType>('@gittrends/cli', {
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

export function withBullWorker(
  worker: (job: Job<CliJobType>) => Promise<void>,
  concurrency: number,
): Worker<CliJobType> {
  return new Worker<CliJobType>('@gittrends/cli', worker, {
    connection: { host: REDIS_HOST, port: REDIS_PORT, db: REDIS_DB },
    maxStalledCount: Number.MAX_SAFE_INTEGER,
    concurrency,
    autorun: true,
  });
}
