import { queue } from 'async';
import consola from 'consola';
import { GlobSync } from 'glob';
import { homedir } from 'os';
import path, { resolve } from 'path';

import { migrate } from '../config/knex.config';

(async () => {
  consola.info('Searching for .sqlite files ...');
  const baseDir = path.resolve(homedir(), '.gittrends');
  const matches = new GlobSync('**/*.sqlite', { cwd: baseDir });

  consola.info('Preparing processing queue ...');
  const q = queue(async (db: string) => {
    consola.log(`-> migrating ${db}`);
    await migrate(resolve(baseDir, db));
  }, 10);

  q.push(matches.found);

  await q.drain();

  consola.success('Done!');
})();
