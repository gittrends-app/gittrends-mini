import getPort from 'get-port';
import { Server } from 'http';
import { setTimeout } from 'timers/promises';
import { DirectoryResult, dir } from 'tmp-promise';

import { createClient } from './client';
import { server } from './server';
import { CacheAPI } from './services/CacheAPI';
import FileCache from './services/FileCache';
import MemoryCache from './services/MemoryCache';

describe('Cache API', () => {
  let cacheClient: CacheAPI[], cacheServer: Server[];
  let dirRef: DirectoryResult | undefined;

  beforeAll(async () => {
    dirRef = await dir({ prefix: 'gittrends_cache_' });

    const ports = await Promise.all([getPort(), getPort()]);

    cacheServer = await Promise.all([
      server(new FileCache({ db: dirRef.path, cacheSize: 1, cleanupInterval: 2000 }), { port: ports[0], silent: true }),
      server(new MemoryCache({ cacheSize: 1, cleanupInterval: 2000 }), { port: ports[1], silent: true }),
    ]);

    cacheClient = [
      createClient({ host: 'localhost', port: ports[0] }),
      createClient({ host: 'localhost', port: ports[1] }),
    ];
  });

  it('should return undefined if key not exists', async () => {
    for (const client of cacheClient) {
      await expect(client.get('key')).resolves.toBeUndefined();
    }
  });

  it('should store a key and value', async () => {
    for (const client of cacheClient) {
      await expect(client.add('key', 'value')).resolves.toBe(void 0);
      await expect(client.get('key')).resolves.toBe('value');
      await expect(client.get('key_2')).resolves.toBeUndefined();
    }
  });

  it('should delete a key', async () => {
    for (const client of cacheClient) {
      await expect(client.add('key', 'value')).resolves.toBe(void 0);
      await expect(client.get('key')).resolves.toBe('value');
      await expect(client.delete('key')).resolves.toBe(true);
      await expect(client.get('key')).resolves.toBeUndefined();
    }
  });

  it('should expire keys', async () => {
    for (const client of cacheClient) {
      await expect(client.add('key', 'value', 500)).resolves.toBe(void 0);
      await expect(client.get('key')).resolves.toBe('value');
      await setTimeout(500, void 0);
      await expect(client.get('key')).resolves.toBeUndefined();
    }
  });

  it('should cleanup expired keys', async () => {
    for (const client of cacheClient) {
      await expect(client.add('permanent_key', 'permanent_value')).resolves.toBe(void 0);
      await expect(client.add('temporary_key', 'temporary_value', 500)).resolves.toBe(void 0);
      await expect(client.get('permanent_key')).resolves.toBe('permanent_value');
      await expect(client.get('temporary_key')).resolves.toBe('temporary_value');
      await setTimeout(2500, void 0);
      await expect(client.get('permanent_key')).resolves.toBe('permanent_value');
      await expect(client.get('temporary_key')).resolves.toBe(void 0);
    }
  });

  afterAll(async () => {
    await Promise.allSettled([
      ...cacheServer.map(
        (server) => new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
      ),
      dirRef?.cleanup(),
    ]);
  });
});
