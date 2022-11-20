import getPort from 'get-port';
import { Server } from 'http';
import { DirectoryResult, dir } from 'tmp-promise';

import { CacheClientAPI, createClient } from './client';
import { server } from './server';

describe('Cache API', () => {
  let cacheClient: CacheClientAPI | undefined, cacheServer: Server | undefined;
  let dirRef: DirectoryResult | undefined;

  beforeAll(async () => {
    dirRef = await dir({ prefix: 'gittrends_cache_' });
    const port = await getPort();

    cacheServer = await server({ db: dirRef.path, port, cacheSize: 1, silent: true });
    cacheClient = createClient({ host: 'localhost', port });
  });

  it('should return undefined if key not exists', async () => {
    await expect(cacheClient?.get('key')).resolves.toBeUndefined();
  });

  it('should store a key and value', async () => {
    await expect(cacheClient?.add('key', 'value')).resolves.toBe(void 0);
    await expect(cacheClient?.get('key')).resolves.toBe('value');
    await expect(cacheClient?.get('key_2')).resolves.toBeUndefined();
  });

  it('should delete a key', async () => {
    await expect(cacheClient?.add('key', 'value')).resolves.toBe(void 0);
    await expect(cacheClient?.get('key')).resolves.toBe('value');
    await expect(cacheClient?.delete('key')).resolves.toBe(true);
    await expect(cacheClient?.get('key')).resolves.toBeUndefined();
  });

  afterAll(async () => {
    await Promise.allSettled([
      new Promise<void>((resolve, reject) => cacheServer?.close((err) => (err ? reject(err) : resolve()))),
      dirRef?.cleanup(),
    ]);
  });
});
