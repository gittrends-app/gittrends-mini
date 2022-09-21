import { each } from 'bluebird';
import { Option, program } from 'commander';
import dayjs from 'dayjs';
import { GlobSync } from 'glob';

import { Dependency, Release, Repository, Stargazer, Tag, Watcher } from '@gittrends/lib';

import { BASE_DIR } from '../config/knex.config';
import { withBullQueue } from '../helpers/withBullQueue';
import { withDatabase } from '../helpers/withDatabase';
import { version } from '../package.json';

const Resources = [Repository, Stargazer, Watcher, Tag, Release, Dependency].map((entity) => entity.__collection_name);

export async function schedule(hours = 24) {
  const { found } = new GlobSync('**/*.sqlite', { cwd: BASE_DIR });

  const repos = found.map((file) => file.replace(/\.sqlite$/i, ''));

  await withBullQueue((queue) =>
    each(repos, async (repo) => {
      const metadata = await withDatabase(repo, async ({ repositories, metadata }) => {
        const details = await repositories.findByName(repo);
        if (!details) throw new Error('Database corrupted, repository details not found!');
        return metadata.findByRepository(details.id);
      });

      const priority = Resources.reduce((acc, resource) => {
        const meta = metadata.find((m) => m.resource === resource);
        if (!meta) return acc;
        else if (dayjs(meta.updated_at).isBefore(dayjs().subtract(hours, 'hours'))) return acc + 2;
        else return acc + 4;
      }, 1);

      return queue.getJob(repo).then(async (job) => {
        if (!(await job?.isActive())) await job?.remove();
        return queue.add('repositories', undefined, { priority, jobId: repo });
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
