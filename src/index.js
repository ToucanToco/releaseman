import Package from '../package'
import Store from './store'
import yargs from 'yargs'
import { START } from './actions'
import { logError, logHint } from './log'

const { argv } = yargs
  .boolean('doc')
  .boolean('release')
  .default('release', true)
  .help(false)
  .version(Package.version)

logHint(`${Package.name} v${Package.version}\n`)

try {
  Store.dispatch(START, argv)
} catch (e) {
  logError(e)

  throw 1
}
