import { mapSeries } from 'bluebird';
import debug from 'debug';
import { chunk, compact, get } from 'lodash';

import { HttpClient } from '@gittrends/github';

import { ProxyService } from '@gittrends/service';

import { Actor, RepositoryResource } from '@gittrends/entities';

import { withDatabase } from '../../helpers/withDatabase';
import { UpdatableResource } from './index';

export const logger = debug('cli:update-worker');

export type UpdaterOpts = {
  httpClient: HttpClient;
  resources: UpdatableResource[];
  onProgress?: (progress: Record<string, { done: boolean; current: number; total: number }>) => void | Promise<void>;
};

export async function updater(name: string, opts: UpdaterOpts) {
  logger(`Starting updater for ${name} (resources: ${opts.resources.map((r) => r.__collection_name).join(', ')})`);
  await withDatabase(name, async (localRepos) => {
    const localService = new ProxyService(opts.httpClient, localRepos);

    logger('Finding repository localy...');
    let repo = await localRepos.repositories.findByName(name);
    if (!repo) throw new Error(`Database corrupted! Repository ${name} not found!`);

    logger('Updating repository data from github...');
    repo = await localService.get(repo.id, { noCache: true });
    if (!repo) throw new Error(`Repository ${name} not found!`);

    logger('Updating local data...');
    await withDatabase('public', async ({ repositories }) => repo && repositories.save(repo));

    logger('Preparing resources metadata...');
    const repositoryResources = opts.resources
      .filter((r) => r !== Actor)
      .map((resource) => ({
        resource,
        repository: localRepos.get<RepositoryResource>(resource),
      }));

    let actorsIds: Array<{ id: string }> | undefined;
    if (opts.resources.includes(Actor)) {
      logger('Finding for not updated actors...');
      actorsIds = await localRepos.knex.select('id').from(Actor.__collection_name).whereNull('__updated_at');
    }

    logger('Getting resources metadata...');
    const repositoryResourcesMeta = await mapSeries(repositoryResources, async (info) => {
      const [meta] = await localRepos.metadata.findByRepository(repo?.id as string, info.resource.__collection_name);
      const cachedCount = await info.repository.countByRepository(repo?.id as string);
      const total = get(repo, info.resource.__collection_name, 0);

      return { resource: info.resource, done: false, current: cachedCount, total, endCursor: meta?.end_cursor };
    });

    logger('Getting actors metadata...');
    const usersResourceInfo = opts.resources.includes(Actor)
      ? { resource: Actor, done: false, current: 0, total: actorsIds?.length || 0 }
      : undefined;

    const reportCurrentProgress = async function () {
      if (!opts.onProgress) return;

      return opts.onProgress(
        [...repositoryResourcesMeta, ...(usersResourceInfo ? [usersResourceInfo] : [])].reduce(
          (progress, { resource, ...info }) => ({ ...progress, [resource.__collection_name]: info }),
          {},
        ),
      );
    };

    const iterator = localService.resources(repo.id, repositoryResourcesMeta, { ignoreCache: true });

    logger('Starting actors update...');
    const actorsUpdatePromise = usersResourceInfo
      ? withDatabase('public', async (publicActorsRepos) => {
          if (!actorsIds?.length) return;
          const actorsProxy = new ProxyService(opts.httpClient, publicActorsRepos);
          for (const [index, iChunk] of chunk(actorsIds, 100).entries()) {
            logger(`Updating ${iChunk.length * index + iChunk.length} (of ${actorsIds.length}) actors...`);
            const actors = await actorsProxy.getActor(iChunk.map((i) => i.id)).then(compact);
            if (iChunk.length > actors.length)
              logger(`${iChunk.length - actors.length} actors could not be resolved...`);
            await localRepos.actors.save(actors, { onConflict: 'merge' }).finally(async () => {
              usersResourceInfo.current += iChunk.length;
              return reportCurrentProgress();
            });
          }
          usersResourceInfo.done = true;
          logger(`${actorsIds.length} actors updated...`);
        })
      : Promise.resolve();

    logger('Starting resources update...');
    const resourcesUpdatePromise = (async () => {
      logger('Iterating over resources...');
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await iterator.next();
        if (done) break;
        repositoryResourcesMeta.forEach((info, index) => {
          info.done = !value[index].hasNextPage;
          info.current += value[index].items.length;
        });
        await reportCurrentProgress();
      }
    })();

    logger('Waiting update process to finish...');
    await Promise.allSettled(
      [actorsUpdatePromise, resourcesUpdatePromise].map((promise) => promise.finally(() => reportCurrentProgress())),
    );
  });
}