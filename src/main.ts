import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as E from 'fp-ts/lib/Either';
import dotenv from 'dotenv';

dotenv.config();

import { app } from './app';

RTE.run(app, process.env)
  .then(E.fold(
    (e) => console.log(e),
    _ => console.log('ura')
  ));