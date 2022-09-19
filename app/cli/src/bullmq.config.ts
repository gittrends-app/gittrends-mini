import { Processor, Queue, Worker } from 'bullmq';

const connection = { host: 'localhost', port: 6379 };

export function createQueue() {
  return new Queue('@gittrends/cli', { connection });
}

export function createWorker(handler: Processor) {
  return new Worker('@gittrends/cli', handler, { connection });
}
