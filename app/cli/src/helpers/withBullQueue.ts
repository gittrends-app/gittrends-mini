import Queue from 'bull';

export async function withBullQueue<T>(callback: (queue: Queue.Queue) => Promise<T>): Promise<T> {
  const queue = new Queue('@gittrends/cli', {
    redis: { host: 'localhost', port: 6379 },
    settings: { maxStalledCount: Number.MAX_SAFE_INTEGER },
    defaultJobOptions: { attempts: 2 },
  });

  return callback(queue).finally(() => queue.close());
}
