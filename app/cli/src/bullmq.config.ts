import { Processor, Queue, QueueEvents, Worker, WorkerOptions } from 'bullmq';

const connection = { host: 'localhost', port: 6379 };

export function createQueue() {
  return new Queue('@gittrends/cli', { connection });
}

export function createEvents() {
  return new QueueEvents('@gittrends/cli', { connection });
}

export function createWorker(handler: Processor, opts?: WorkerOptions) {
  return new Worker('@gittrends/cli', handler, { ...opts, connection });
}
