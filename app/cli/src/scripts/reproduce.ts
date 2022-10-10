import { Argument, program } from 'commander';
import consola from 'consola';
import inquirer from 'inquirer';
import prettyjson from 'prettyjson';

import { HttpClient } from '@gittrends/github';

import { GitHubService } from '@gittrends/service';

import { Dependency, Issue, PullRequest, Release, Stargazer, Tag, Watcher } from '@gittrends/entities';

import { version } from '../package.json';

const Entities = [Dependency, Issue, PullRequest, Release, Stargazer, Tag, Watcher];

export async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
  program
    .addArgument(new Argument('[resource]', 'Component name').choices(Entities.map((e) => e.__collection_name)))
    .addArgument(new Argument('[repository]', 'Repository identifier'))
    .addArgument(new Argument('[end_cursor]', 'End cursor'))
    .action(async (resource?: string, repository?: string, endCursor?: string) => {
      const questions = [
        {
          type: 'list',
          name: 'resource',
          message: 'Select the resource to reproduce',
          choices: Entities.map((e) => ({ name: e.__collection_name, value: e.__collection_name })),
          default: resource,
          when: !resource,
        },
        {
          type: 'input',
          name: 'repository',
          message: 'Enter the repository ID',
          validate: (input?: string) => (!input ? 'Repository ID is mandatory!' : true),
          default: repository,
          when: !repository,
        },
        {
          type: 'input',
          name: 'endCursor',
          message: 'Enter the endCursor (if any)',
          default: endCursor,
          when: !endCursor,
        },
      ];

      await inquirer
        .prompt(questions)
        .then((responses) => ({ ...{ resource, repository, endCursor }, ...responses }))
        .then(async (responses: { resource: string; repository: string; endCursor: string }) => {
          consola.info('Starting reproducer...');
          consola.log(prettyjson.render(responses));

          const service = new GitHubService(
            new HttpClient({ host: 'localhost', protocol: 'http', port: 3000, timeout: 60000 }),
          );

          consola.info('Preparing GitHubService resources iterator...');
          const iterator = service.resources(responses.repository, [
            {
              resource: Entities.find((e) => e.__collection_name === responses.resource),
              endCursor: responses.endCursor,
            },
          ]);

          consola.info('Iterating over results...');
          for await (const [result] of iterator) {
            consola.info(prettyjson.render(result, { inlineArrays: false }));
          }
        });
    })
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);
