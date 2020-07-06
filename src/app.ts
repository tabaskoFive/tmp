import * as io from 'io-ts';
import fastify from 'fastify';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { promises as fs } from 'fs';
import { pipe } from 'fp-ts/lib/function';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import { sequenceT } from 'fp-ts/lib/Apply';

import redis from 'ioredis';
import { SSM, DynamoDB } from 'aws-sdk';

import { ReaderTaskEither } from '../types/types';
import PlayerRepo from '../lib/PlayerRepo';

const TCredentials = io.type({
  redisPort: io.string,
  redisHost: io.string,
  redisDbIndex: io.string
}, 'Credentials');
const TGameConfig = io.type({
  reward: io.number,
}, 'GameConfig');
const TServerConfig = io.type({
  port: io.number,
}, 'ServerConfig');
const TConfig = io.type({
  gameConfig: TGameConfig,
  serverConfig: TServerConfig,
  credentials: TCredentials,
}, 'Config');

export type Credentials = io.TypeOf<typeof TCredentials>;
export type GameConfig = io.TypeOf<typeof TGameConfig>;
export type ServerConfig = io.TypeOf<typeof TServerConfig>;
export type Config = io.TypeOf<typeof TConfig>;

const validator = <T extends io.Props>(type: io.TypeC<T>) => (a: unknown) => {
  return pipe(
    type.validate(a, io.getDefaultContext(type)),
    E.mapLeft((errs) => new Error(PathReporter.report(E.left(errs)).join('\n')))
  );
}

export const readEnv: ReaderTaskEither<NodeJS.ProcessEnv, Error, Config> = (env) => {
  // const readEnvVar = (s?: string) => E.fromNullable(new Error(msg))(s);
  const getCredentials = (path: string) =>
    new Promise((res) => setTimeout(() => res({
      redisPort: '6578',
      redisHost: '127.0.0.1',
      redisDbIndex: '0',
    }), 1500));
  const getGameConfig = (path: string) => fs.readFile(path)
    .then(String)
    .then(JSON.parse);
  const getServerConfig = (path: string) => fs.readFile(path)
    .then(String)
    .then(JSON.parse);
  const validateConfig = validator(TConfig);

  return pipe(
    sequenceT(TE.taskEither)(
      TE.fromOption(() => new Error('missing server config path'))(O.fromNullable(env.SERVER_CONFIG_PATH)),
      TE.fromOption(() => new Error('missing game config path'))(O.fromNullable(env.GAME_CONFIG_PATH)),
      TE.fromOption(() => new Error('missing SSM path'))(O.fromNullable(env.SSM_PATH)),
    ),
    TE.chain(([spath, gpath, cpath]) => TE.tryCatch(
      () => Promise.all([
        getServerConfig(spath),
        getGameConfig(gpath),
        getCredentials(cpath),
      ]),
      r => new Error(`read env error ${String(r)}`)
    )),
    TE.map(([serverConfig, gameConfig, credentials]) => ({ serverConfig, gameConfig, credentials })),
    TE.chain(parsed => TE.fromEither(validateConfig(parsed)))
  );
};

export const startServer: (c: Config) => ReaderTaskEither<NodeJS.ProcessEnv, Error, void> = (config) => {
  return (env) => TE.tryCatch(
    async () => {
      const isDevelopment = env['NODE_ENV'] === 'dev';
      const { credentials, gameConfig, serverConfig } = config;

      // const redisClient = redis(
      //   Number(credentials.redisPort),
      //   credentials.redisHost,
      // );
      // const dynamoClient = new DynamoDB();
      // const mysqlClient = {};
      
      // const playerRepo = new PlayerRepo(dynamoClient, redisClient);

      const playerApi= () => ;
      // // const merchantApi = new MerchantApi(playerRepo, gameConfig);
      // // const leaderBoard = new LeaderBoardApi(playerRepo, gameConfig);

      // server.use(merchantApi);
      // server.route(leaderBoard);

      const server = fastify({
        logger: isDevelopment ? console.log : null,
        disableRequestLogging: false,
      });

      server.register([playerApi]);
    },
    E.toError
  )
}
export const app: ReaderTaskEither<NodeJS.ProcessEnv, Error, void> = pipe(
  readEnv,
  RTE.chain(startServer)
);
