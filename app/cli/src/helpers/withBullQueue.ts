import Queue from 'bull';

const REDIS_HOST = process.env.CLI_REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.CLI_REDIS_PORT || 6379;
const REDIS_DB = process.env.CLI_REDIS_DB || 0;

export async function withBullQueue<T>(callback: (queue: Queue.Queue) => Promise<T>): Promise<T> {
  const queue = new Queue('@gittrends/cli', {
    redis: { host: REDIS_HOST, port: REDIS_PORT, db: REDIS_DB },
    settings: { maxStalledCount: Number.MAX_SAFE_INTEGER },
    defaultJobOptions: { attempts: 1 },
  });

  return callback(queue).finally(() => queue.close());
}
