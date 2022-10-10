import consola from 'consola';
import inquirer from 'inquirer';
import { pick } from 'lodash';

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

type ComponentBuilder =
  | DependenciesComponentBuilder
  | IssuesComponentBuilder
  | PullRequestsComponentBuilder
  | ReleasesComponentBuilder
  | StargazersComponentBuilder
  | TagsComponentBuilder
  | WatchersComponentBuilder;

type ComponentBuilderRef = new (repository: string, endCursor?: string) => ComponentBuilder;

(async () => {
  await inquirer
    .prompt([
      {
        type: 'list',
        name: 'component',
        message: 'Select the component to reproduce',
        choices: [
          { name: 'Dependencies', value: DependenciesComponentBuilder },
          { name: 'Issues', value: IssuesComponentBuilder },
          { name: 'PullRequests', value: PullRequestsComponentBuilder },
          { name: 'Releases', value: ReleasesComponentBuilder },
          { name: 'Stargazers', value: StargazersComponentBuilder },
          { name: 'Tags', value: TagsComponentBuilder },
          { name: 'Watchers', value: WatchersComponentBuilder },
        ],
      },
      {
        type: 'input',
        name: 'repository',
        message: 'Enter the repository ID',
        validate: (input) => (!input ? 'Repository ID is mandatory!' : true),
      },
      {
        type: 'input',
        name: 'endCursor',
        message: 'Enter the endCursor (if any)',
      },
    ])
    .then(async (responses: { component: ComponentBuilderRef; repository: string; endCursor: string }) => {
      consola.info('Rebuilding component with the provided parameters...');
      const ref = new responses.component(responses.repository, responses.endCursor);

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
})();
