import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Static, Type } from '@sinclair/typebox';
import { Option, program } from 'commander';
import Fastify from 'fastify';
import { Server } from 'http';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import leveldown from 'leveldown';
import levelup from 'levelup';
import { homedir } from 'os';
import { join } from 'path';

const POSTRequest = Type.Object({
  key: Type.String(),
  data: Type.String(),
});

const GETRequest = Type.Object({
  key: Type.String(),
});

const DELRequest = Type.Object({
  key: Type.String(),
});

type CliOpts = { port: number; db: string; cacheSize: number; silent?: boolean };
type AddRequestType = Static<typeof POSTRequest>;
type GetRequestType = Static<typeof GETRequest>;
type DelRequestType = Static<typeof DELRequest>;

export async function server(opts: CliOpts): Promise<Server> {
  const fastify = Fastify({ logger: !opts.silent }).withTypeProvider<TypeBoxTypeProvider>();

  const cache = levelup(leveldown(opts.db), { cacheSize: (opts.cacheSize || 8) * 1024 * 1024 });

  fastify.post<{ Body: AddRequestType }>('/', { schema: { body: POSTRequest } }, (req, reply) => {
    const { key, data } = req.body;
    cache
      .put(key, data)
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
      .then((data) =>
        res
          .status(StatusCodes.OK)
          .send({ status: ReasonPhrases.OK, message: ReasonPhrases.OK, data: data?.toString() }),
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
      .del(key)
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
    .then(() => !opts.silent && console.log(`Server running on *:${opts.port}`));

  return fastify.server;
}

async function cli(args: string[], from: 'user' | 'node' = 'node') {
  return program
    .addOption(new Option('--cache-size <size>', 'Cache size in MB').env('CACHE_SIZE').default(64).argParser(Number))
    .addOption(new Option('--port <port>', 'Running port').env('PORT').default(3000).argParser(Number))
    .addOption(
      new Option('--db <path>', 'DB path')
        .env('CACHE_PATH')
        .default(join(homedir(), '.gittrends.cache'))
        .makeOptionMandatory(),
    )
    .addOption(new Option('--silent'))
    .action(async (opts: CliOpts): Promise<any> => server(opts))
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);
