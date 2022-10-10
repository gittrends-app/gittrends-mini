import { Argument, program } from 'commander';
import consola from 'consola';
import inquirer from 'inquirer';
import { pick } from 'lodash';
import prettyjson from 'prettyjson';

import { HttpClient, Query } from '@gittrends/github/dist';

import {
  DependenciesComponentBuilder,
  IssuesComponentBuilder,
  PullRequestsComponentBuilder,
  ReleasesComponentBuilder,
  StargazersComponentBuilder,
  TagsComponentBuilder,
  WatchersComponentBuilder,
} from '@gittrends/service';

import { version } from '../package.json';

type ComponentBuilder =
  | DependenciesComponentBuilder
  | IssuesComponentBuilder
  | PullRequestsComponentBuilder
  | ReleasesComponentBuilder
  | StargazersComponentBuilder
  | TagsComponentBuilder
  | WatchersComponentBuilder;

type ComponentBuilderRef = new (repository: string, endCursor?: string) => ComponentBuilder;

const ComponentNames = ['Dependencies', 'Issues', 'PullRequests', 'Releases', 'Stargazers', 'Tags', 'Watchers'];

export async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
  program
    .addArgument(new Argument('[component]', 'Component name').choices(ComponentNames))
    .addArgument(new Argument('[repository_id]', 'Repository identifier'))
    .addArgument(new Argument('[end_cursor]', 'End cursor'))
    .action(async (component?: string, repository?: string, endCursor?: string) => {
      function getComponentBuilder(name: string): ComponentBuilderRef {
        if (name === 'Dependencies') return DependenciesComponentBuilder;
        else if (name === 'Issues') return IssuesComponentBuilder;
        else if (name === 'PullRequests') return PullRequestsComponentBuilder;
        else if (name === 'Releases') return ReleasesComponentBuilder;
        else if (name === 'Stargazers') return StargazersComponentBuilder;
        else if (name === 'Tags') return TagsComponentBuilder;
        else if (name === 'Watchers') return WatchersComponentBuilder;
        throw new Error('Unknown component builder!');
      }

      const questions = [
        {
          type: 'list',
          name: 'component',
          message: 'Select the component to reproduce',
          choices: ComponentNames.map((cn) => ({ name: cn, value: cn })),
          default: component,
          when: !component,
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
        .then((responses) => ({ ...{ component, repository, endCursor }, ...responses }))
        .then(async (responses: { component: string; repository: string; endCursor: string }) => {
          consola.info('Starting reproducer...');
          consola.log(prettyjson.render(responses));

          consola.info('Rebuilding component with the provided parameters...');
          const ComponentRef = getComponentBuilder(responses.component);
          const ref = new ComponentRef(responses.repository, responses.endCursor ? responses.endCursor : undefined);

          consola.info('Preparing iterator function...');
          async function buildRequestParse(error?: Error): Promise<any> {
            consola.info('Building http components...');
            const components = ref.build(error);
            const componentsList = Array.isArray(components) ? components : [components];

            consola.info('Running query using local http client...');
            return Query.create(new HttpClient({ host: 'localhost', protocol: 'http', port: 3000, timeout: 60000 }))
              .compose(...componentsList)
              .run()
              .catch((error) => buildRequestParse(error))
              .then((response) => {
                consola.info('Parsing response server...');
                const data = ref.parse(
                  pick(
                    response,
                    componentsList.map((c) => c.alias),
                  ),
                );

                consola.log('Metadata: ', prettyjson.render(componentsList.map((c) => c.toJSON())));

                if (data.hasNextPage) {
                  consola.info('There is more data, requesting additionl info...');
                  return buildRequestParse();
                }

                consola.info('Requests done, finishing...');
                return data;
              });
          }

          return buildRequestParse()
            .then(console.log)
            .catch((error) => {
              console.error(error);
              throw error;
            });
        });
    })
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);
