import getPort from 'get-port';
import { Server } from 'http';
import { setTimeout } from 'timers/promises';
import { DirectoryResult, dir } from 'tmp-promise';

import { CacheClientAPI, createClient } from './client';
import { server } from './server';

describe('Cache API', () => {
  let cacheClient: CacheClientAPI | undefined, cacheServer: Server | undefined;
  let dirRef: DirectoryResult | undefined;

  beforeAll(async () => {
    dirRef = await dir({ prefix: 'gittrends_cache_' });
    const port = await getPort();

    cacheServer = await server({ db: dirRef.path, port, cacheSize: 1, silent: true, cleanupInterval: 2000 });
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

  it('should expire keys', async () => {
    await expect(cacheClient?.add('key', 'value', 500)).resolves.toBe(void 0);
    await expect(cacheClient?.get('key')).resolves.toBe('value');
    await setTimeout(500, void 0);
    await expect(cacheClient?.get('key')).resolves.toBeUndefined();
  });

  it('should cleanup expired keys', async () => {
    await expect(cacheClient?.add('permanent_key', 'permanent_value')).resolves.toBe(void 0);
    await expect(cacheClient?.add('temporary_key', 'temporary_value', 500)).resolves.toBe(void 0);
    await expect(cacheClient?.get('permanent_key')).resolves.toBe('permanent_value');
    await expect(cacheClient?.get('temporary_key')).resolves.toBe('temporary_value');
    await setTimeout(2500, void 0);
    await expect(cacheClient?.get('permanent_key')).resolves.toBe('permanent_value');
    await expect(cacheClient?.get('temporary_key')).resolves.toBe(void 0);
  });

  afterAll(async () => {
    await Promise.allSettled([
      new Promise<void>((resolve, reject) => cacheServer?.close((err) => (err ? reject(err) : resolve()))),
      dirRef?.cleanup(),
    ]);
  });
});
