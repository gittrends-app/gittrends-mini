import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Static, Type } from '@sinclair/typebox';
import { Option, program } from 'commander';
import Fastify from 'fastify';
import { Server } from 'http';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { homedir } from 'os';
import { join } from 'path';

import { CacheServiceAPI } from './services/CacheAPI';
import FileCache from './services/FileCache';
import MemoryCache from './services/MemoryCache';

const POSTRequest = Type.Object({
  key: Type.String(),
  data: Type.String(),
  expires: Type.Optional(Type.String()),
});

const GETRequest = Type.Object({
  key: Type.String(),
});

const DELRequest = Type.Object({
  key: Type.String(),
});

type AddRequestType = Static<typeof POSTRequest>;
type GetRequestType = Static<typeof GETRequest>;
type DelRequestType = Static<typeof DELRequest>;

export async function server(cache: CacheServiceAPI, opts: { port: number; silent?: boolean }): Promise<Server> {
  const fastify = Fastify({
    logger: opts.silent ? false : { transport: { target: 'pino-pretty', options: { singleLine: true } } },
  }).withTypeProvider<TypeBoxTypeProvider>();

  fastify.post<{ Body: AddRequestType }>('/', { schema: { body: POSTRequest } }, (req, reply) => {
    const { key, data, expires } = req.body;
    cache
      .add(key, data, expires)
      .then(() =>
        reply.status(StatusCodes.CREATED).send({ status: ReasonPhrases.CREATED, message: ReasonPhrases.CREATED }),
      )
      .catch((error) => {
        reply
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ status: StatusCodes.INTERNAL_SERVER_ERROR, message: error.message || error });
        throw error;
      });
  });

  fastify.get<{ Querystring: GetRequestType }>('/', { schema: { querystring: GETRequest } }, (req, res) => {
    const { key } = req.query;
    cache
      .get(key)
      .then(async (result) =>
        res.status(StatusCodes.OK).send({ status: ReasonPhrases.OK, message: ReasonPhrases.OK, data: result }),
      )
      .catch((error) => {
        if (error.notFound) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .send({ status: ReasonPhrases.NOT_FOUND, message: ReasonPhrases.NOT_FOUND });
        }

        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ status: StatusCodes.INTERNAL_SERVER_ERROR, message: error.message || error });

        throw error;
      });
  });

  fastify.delete<{ Querystring: DelRequestType }>('/', { schema: { querystring: DELRequest } }, (req, res) => {
    const { key } = req.query;
    cache
      .delete(key)
      .then(() => res.status(StatusCodes.OK).send({ status: ReasonPhrases.OK, message: ReasonPhrases.OK }))
      .catch((error) => {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ status: StatusCodes.INTERNAL_SERVER_ERROR, message: error.message || error });
        throw error;
      });
  });

  await fastify
    .listen({ port: opts.port, host: '0.0.0.0' })
    .then(() => !opts.silent && console.log(`Server running on http://0.0.0.0:${opts.port}`));

  fastify.server.on('close', () => cache.close());

  return fastify.server;
}

type CliOpts = {
  type: 'memory' | 'file';
  port: number;
  cacheSize: number;
  cleanupInterval: number | string;
  db?: string;
  silent?: boolean;
};

async function cli(args: string[], from: 'user' | 'node' = 'node') {
  return program
    .addOption(new Option('--type <type>', 'Cache type').choices(['memory', 'file']).default('memory'))
    .addOption(new Option('--port <port>', 'Running port').env('PORT').default(3000).argParser(Number))
    .addOption(new Option('--cache-size <size>', 'Cache size in MB').default(64).argParser(Number))
    .addOption(new Option('--cleanup-interval <interval>', 'Cache cleanup interval').default('1 hour'))
    .addOption(new Option('--db <path>', 'DB path'))
    .addOption(new Option('--silent'))
    .action(async (opts: CliOpts): Promise<any> => {
      const cacheOpts = { cacheSize: opts.cacheSize, cleanupInterval: opts.cleanupInterval };

      const cache =
        opts.type === 'memory'
          ? new MemoryCache(cacheOpts)
          : new FileCache({ db: opts.db || join(homedir(), '.gittrends.cache'), ...cacheOpts });

      return server(cache, opts);
    })
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);
