import { program } from 'commander';
import { resolve } from 'path';

import { version } from './package.json';

program
  .command('add-repositories', 'Run add-repositories script', {
    executableFile: resolve(__dirname, 'scripts', 'add-repositories'),
  })
  .command('bull-board', 'Run bull queue board', {
    executableFile: resolve(__dirname, 'scripts', 'queue-board', 'index'),
  })
  .command('migrations', 'Run migrations script', { executableFile: resolve(__dirname, 'scripts', 'migrations') })
  .command('schedule', 'Run schedule script', { executableFile: resolve(__dirname, 'scripts', 'schedule') })
  .command('update', 'Run update script', { executableFile: resolve(__dirname, 'scripts', 'update'), isDefault: true })
  .helpOption(true)
  .version(version)
  .parseAsync(process.argv);
