import Package from '../package';
import Store from './store';
import yargs from 'yargs';
import { START } from './actions';
import { logError, logHint } from './log';

const { argv } = yargs
  .boolean('doc')
  .boolean('punk')
  .coerce('categories', JSON.parse)
  .help(false);

logHint(`${Package.name} v${Package.version}\n`);

Store
  .dispatch(START, argv)
  .catch((e) => (
    setTimeout(() => {
      logError(e);

      throw 1;
    }, 0)
  ));
