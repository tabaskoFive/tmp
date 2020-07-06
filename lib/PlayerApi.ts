import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as E from 'fp-ts/lib/Either';

import PlayerRepo from "./PlayerRepo";
import { GameConfig } from "../src/app";
import fastify from "fastify";
import { ReaderTaskEither } from "../types/types";
import { ReaderEither } from 'fp-ts/lib/ReaderEither';

interface Dependencies {
  playerRepo: PlayerRepo,
  gameConfig: GameConfig,
}

// const mid = () => 

// const getPlayer: ReaderTaskEither<Dependencies, Error, string> = (deps) => ()

//  server      app       server
// req, res -> logic -> response
export default (deps: Dependencies) => (server: fastify.FastifyInstance, opts: fastify.RouteOptions) => {
  const rootPath = 'player';

  // const getPlayer: ReaderEither<Dependencies, Error, > 


  server.get('/', async (req, res) => await RTE.run(getPlayer, deps)
    .then(E.fold(
      (e) => res.send(e),
      (b) => res.send("ok" + b)
    )));
};
