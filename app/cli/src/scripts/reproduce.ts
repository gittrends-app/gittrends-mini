import { Argument, program } from 'commander';
import consola from 'consola';
import inquirer from 'inquirer';
import prettyjson from 'prettyjson';

import { HttpClient } from '@gittrends/github';

import { GitHubService } from '@gittrends/service';

import { version } from '../package.json';

const resources = [
  'actors',
  'dependencies',
  'issues',
  'pull_requests',
  'releases',
  'stargazers',
  'tags',
  'watchers',
] as const;

export async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
  program
    .addArgument(new Argument('[resource]', 'Component name').choices(resources))
    .addArgument(new Argument('[repository]', 'Repository identifier'))
    .addArgument(new Argument('[end_cursor]', 'End cursor'))
    .action(async (resource?: string, repository?: string, endCursor?: string) => {
      const questions = [
        {
          type: 'list',
          name: 'resource',
          message: 'Select the resource to reproduce',
          choices: resources.map((e) => ({ name: e, value: e })),
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

          const apiURL = new URL(process.env.CLI_API_URL || 'https://api.github.com');

          const service = new GitHubService(
            new HttpClient({
              host: apiURL.hostname,
              protocol: apiURL.protocol.slice(0, -1),
              port: parseInt(apiURL.port),
              timeout: 60000,
              retries: 2,
            }),
          );

          consola.info('Preparing GitHubService resources iterator...');
          const iterator = service.resources(responses.repository, [
            {
              resource: resources.find((e) => e === responses.resource),
              endCursor: responses.endCursor || undefined,
            },
          ] as any[]);

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
