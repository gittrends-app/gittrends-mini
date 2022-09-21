import { mapSeries } from 'bluebird';
import { Option, program } from 'commander';
import dayjs from 'dayjs';

import { Dependency, Release, Repository, Stargazer, Tag, Watcher } from '@gittrends/lib';

import { withBullQueue } from '../helpers/withBullQueue';
import { withDatabase } from '../helpers/withDatabase';
import { version } from '../package.json';

const Resources = [Repository, Stargazer, Watcher, Tag, Release, Dependency].map((entity) => entity.__collection_name);

export async function schedule(hours = 24) {
  const repos = await withDatabase<{ id: string; name_with_owner: string }[]>(({ knex }) => {
    return knex.select('id', 'name_with_owner').from(Repository.__collection_name);
  });

  await withBullQueue((queue) =>
    mapSeries(repos, async (repo) => {
      const metadata = await withDatabase(repo.name_with_owner, ({ metadata }) => metadata.findByRepository(repo.id));

      const priority = Resources.reduce((acc, resource) => {
        const meta = metadata.find((m) => m.resource === resource);
        if (!meta) return acc;
        else if (dayjs(meta.updated_at).isBefore(dayjs().subtract(hours, 'hours'))) return acc + 2;
        else return acc + 4;
      }, 1);

      return queue.getJob(repo.name_with_owner).then(async (job) => {
        if (!(await job?.isActive())) await job?.remove();
        return queue.add('repositories', repo, { priority, jobId: repo.name_with_owner });
      });
    }),
  );
}

async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
  await program
    .addOption(new Option('-w, --wait [hours]', 'Number of hours before updating').default(24))
    .action((opts: { wait: number }) => schedule(opts.wait))
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);
