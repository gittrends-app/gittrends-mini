import { parallelLimit } from 'async';
import { Option, program } from 'commander';
import dayjs from 'dayjs';
import { pick } from 'lodash';

import { Dependency, EntityValidationError, Release, Repository, Stargazer, Tag, Watcher } from '@gittrends/entities';
import { debug } from '@gittrends/helpers';

import { getRepositoriesList } from '../config/knex.config';
import { withBullQueue } from '../helpers/withBullQueue';
import { withDatabase } from '../helpers/withDatabase';
import { version } from '../package.json';

const Resources = [Repository, Stargazer, Watcher, Tag, Release, Dependency].map((entity) => entity.__collection_name);

const logger = debug('schedule');

export async function schedule(hours = 24, drain = false, obliterate = false) {
  logger('Connecting to redis server...');
  await withBullQueue(async (queue) => {
    if (obliterate) await queue.obliterate({ force: true });
    else if (drain) await queue.drain();

    async function _schedule(repo: string) {
      await withDatabase(repo, async (repos) => {
        const details = await repos.repositories.findByName(repo);
        if (!details) throw new Error(`Database corrupted, repository "${repo}" details not found!`);

        const metadata = await repos.metadata.findByRepository(details.id);

        const priority = Resources.reduce((acc, resource) => {
          const meta = metadata.find((m) => m.resource === resource);
          if (!meta || !meta.finished_at) return acc;
          else if (dayjs(meta.finished_at).isBefore(dayjs().subtract(hours, 'hour'))) return acc + 2;
          else return acc + 4;
        }, 1);

        return queue.getJob(details.id).then(async (job) => {
          if (!(await job?.isActive())) await job?.remove();
          const data = pick(details, ['id', 'name_with_owner', 'url']);
          return queue.add(details.name_with_owner, data, {
            priority,
            jobId: details.id,
            attempts: parseInt(process.env.CLI_SCHEDULER_ATTEMPS || '3'),
          });
        });
      }).catch((error) => (error instanceof EntityValidationError ? [] : Promise.reject(error)));
    }

    logger('Getting repositories list...');
    const list = await getRepositoriesList();
    logger(`Iterating over repositories list (total: ${list.length})...`);

    return new Promise<void>((resolve, reject) => {
      parallelLimit(
        list.map((name, index) => (callback) => {
          logger(`Scheduling ${name} (index: ${index})...`);
          return _schedule(name)
            .then(() => callback())
            .catch(callback);
        }),
        parseInt(process.env.CLI_SCHEDULER_WORKERS || '10'),
        (error) => (error ? reject(error) : resolve()),
      );
    });
  });
  logger('Repositories scheduled.');
}

export async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
  await program
    .addOption(new Option('-w, --wait [hours]', 'Number of hours before updating').default(24))
    .addOption(new Option('--drain', 'Remove all pending jobs on queue before proceeding'))
    .addOption(new Option('--obliterate', 'Remove all jobs on queue (including the active ones)'))
    .action((opts: { wait: number; drain: boolean; obliterate: boolean }) =>
      schedule(opts.wait, opts.drain, opts.obliterate),
    )
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);
