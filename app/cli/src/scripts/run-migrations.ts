import { queue } from 'async';
import consola from 'consola';
import { GlobSync } from 'glob';
import { resolve } from 'path';

import { BASE_DIR, migrate } from '../config/knex.config';

(async () => {
  consola.info('Searching for .sqlite files ...');
  const matches = new GlobSync('**/*.sqlite', { cwd: BASE_DIR });

  consola.info('Preparing processing queue ...');
  const q = queue(function (db: string, callback) {
    consola.log(`-> migrating ${db}`);
    return migrate(resolve(BASE_DIR, db))
      .then(() => callback())
      .catch((error) => callback(error));
  }, 10);

  q.push(matches.found);

  await q.drain();

  consola.success('Done!');
})();
