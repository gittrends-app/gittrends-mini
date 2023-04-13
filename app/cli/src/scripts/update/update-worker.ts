import dayjs from 'dayjs';
import { chunk, compact, get } from 'lodash';

import { BatchService, PersistenceService, Service } from '@gittrends/service';

import { Actor, Metadata, Repository } from '@gittrends/entities';
import { debug } from '@gittrends/helpers';

import { asyncIterator } from '../../config/knex.config';
import { delay } from '../../helpers/delay';
import { withDatabase } from '../../helpers/withDatabase';
import { UpdatableRepositoryResource, UpdatableResource } from './index';

export const logger = debug('cli:update-worker');

export type UpdaterOpts = {
  service: Service;
  resources: UpdatableResource[];
  before?: Date;
  force?: boolean;
  iterationsToPersist?: number;
  onProgress?: (progress: Record<string, { done: boolean; current: number; total: number }>) => void | Promise<void>;
};

export async function updater(name: string, opts: UpdaterOpts) {
  const before = opts.before || new Date();

  logger(
    `Starting updater for ${name} (resources: ${opts.resources
      .map((r) => r.__name)
      .join(', ')}, before: ${before.toISOString()})`,
  );

  await withDatabase(name, async (dataRepo) => {
    const iterations = opts.iterationsToPersist || 3;

    const service = new PersistenceService(new BatchService(opts.service, iterations), dataRepo);

    logger('Finding repository localy...');
    let repo = await dataRepo.get(Repository).findByName(name);
    if (!repo) throw new Error(`Database corrupted! Repository ${name} not found!`);

    logger('Updating repository data from github...');
    repo = await service.get(repo.id);
    if (!repo) throw new Error(`Repository ${name} not found!`);

    logger('Updating local data...');
    await withDatabase('public', async ({ get }) => repo && get(Repository).upsert(repo));

    logger('Preparing resources metadata...');
    const repositoryResources = opts.resources
      .filter((r) => r !== Actor)
      .map((resource) => ({
        resource: resource as UpdatableRepositoryResource,
        repository: dataRepo.get(resource),
      }));

    logger('Getting resources metadata...');
    const repositoryResourcesMeta = await asyncIterator(repositoryResources, async (info) => {
      const [meta] = await dataRepo.get(Metadata).findByRepository(repo?.id as string, info.resource.__name);
      const cachedCount = await info.repository.countByRepository(repo?.id as string);
      const total = get(repo, info.resource.__name, Infinity);

      return {
        resource: info.resource,
        done: (meta?.finished_at && dayjs(meta.finished_at).isAfter(before)) || false,
        current: cachedCount,
        total,
        endCursor: meta?.end_cursor,
      };
    });

    const usersResourceInfo = { resource: Actor, done: true, current: 0, total: 0 };

    const reportCurrentProgress = async function () {
      if (!opts.onProgress) return;

      return opts.onProgress(
        [...repositoryResourcesMeta, ...(usersResourceInfo ? [usersResourceInfo] : [])].reduce(
          (progress, { resource, ...info }) => ({ ...progress, [resource.__name]: info }),
          {},
        ),
      );
    };

    const pendingResourcesMeta = repositoryResourcesMeta.filter((rm) => !rm.done);
    const iterator = service.resources(repo.id, pendingResourcesMeta);

    logger('Starting resources update...');
    const resourcesUpdate = async function () {
      logger('Iterating over resources...');
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await iterator.next();
        if (done) break;
        pendingResourcesMeta.forEach((info, index) => {
          info.done = !value[index].hasNextPage;
          info.current += value[index].items.length;
        });
        logger(`${value.reduce((total, res) => res.items.length + total, 0)} Entities updated`);
        await reportCurrentProgress();
      }
    };

    async function actorsUpdater(): Promise<void> {
      logger('Starting actors update...');
      logger('Finding for not updated actors...');

      const query = dataRepo.knex.select('id').from(Actor.__name).whereNull('__updated_at');

      const actorsIds: Array<{ id: string }> = await (opts.force
        ? query.orWhere('__updated_at', '<', before).orderBy([{ column: '__updated_at', order: 'asc' }])
        : query);

      if (!actorsIds?.length) return;

      usersResourceInfo.done = false;
      usersResourceInfo.total += actorsIds.length;

      const actorsChunks = chunk(actorsIds, iterations * 100);

      for (const [index, iChunk] of actorsChunks.entries()) {
        logger(`Updating ${iChunk.length * index + iChunk.length} (of ${actorsIds.length}) actors...`);
        const actors = await service.getActor(iChunk.map((i) => i.id)).then(compact);
        if (iChunk.length > actors.length) logger(`${iChunk.length - actors.length} actors could not be resolved...`);
        usersResourceInfo.current += iChunk.length;
        if (actorsChunks.length - 1 === index) usersResourceInfo.done = true;
        await reportCurrentProgress();
      }

      logger(`${actorsIds.length} actors updated...`);
    }

    let resourcesDone = false;

    const actorsReSchedule = async function (): Promise<void> {
      if (opts.resources.includes(Actor))
        await actorsUpdater().then(() => (resourcesDone === false ? delay(15000).then(actorsReSchedule) : null));
    };

    logger('Waiting update process to finish...');
    return Promise.allSettled([resourcesUpdate().finally(() => (resourcesDone = true)), actorsReSchedule()]);
  });
}
