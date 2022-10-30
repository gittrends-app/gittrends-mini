import { parallelLimit } from 'async';
import { Option, program } from 'commander';
import dayjs from 'dayjs';
import { compact } from 'lodash';

import {
  Actor,
  Dependency,
  EntityValidationError,
  Release,
  Repository,
  Stargazer,
  Tag,
  Watcher,
} from '@gittrends/entities';
import { debug } from '@gittrends/helpers';

import { CliJobType, withBullQueue } from '../helpers/withBullQueue';
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
        const details = await repos.repositories.findByName(repo, { resolve: ['owner'] });
        if (!details) throw new Error(`Database corrupted, repository "${repo}" details not found!`);

        const metadata = await repos.metadata.findByRepository(details.id);

        const priorities = compact(
          Resources.map((resource) => {
            const meta = metadata.find((m) => m.resource === resource);
            if (!meta || !meta.finished_at) return { resource, priority: 0 };
            else if (dayjs(meta.finished_at).isBefore(dayjs().subtract(hours, 'hour')))
              return { resource, priority: 2 };
            else return null;
          }),
        );

        if (priorities.length === 0) return;

        return queue.getJob(details.id).then(async (job) => {
          if (!(await job?.isActive())) await job?.remove();

          const data: CliJobType = {
            database_id: details.database_id,
            forks: details.forks,
            id: details.id,
            name_with_owner: details.name_with_owner,
            primary_language: details.primary_language,
            stargazers: details.stargazers,
            avatar_url: (details.owner as Actor).avatar_url,
            description: details.description,
            issues: details.issues,
            pull_requests: details.pull_requests,
            releases: details.releases,
            url: details.url,
            watchers: details.watchers,

            updated_resources: [],
            pending_resources: priorities.map((p) => p.resource),
          };

          return queue.add(details.name_with_owner, data, {
            priority: priorities.reduce((total, p) => total + p.priority, 1),
            jobId: details.id,
            attempts: parseInt(process.env.CLI_SCHEDULER_ATTEMPS || '3'),
          });
        });
      }).catch((error) => (error instanceof EntityValidationError ? [] : Promise.reject(error)));
    }

    logger('Getting repositories list...');
    const list = await withDatabase(({ knex }) =>
      knex
        .select('name_with_owner')
        .from(Repository.__collection_name)
        .then((records: { name_with_owner: string }[]) => records.map((record) => record.name_with_owner)),
    );

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
    .action((opts) => schedule(opts.wait, opts.drain, opts.obliterate))
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);
