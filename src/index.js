import Package from '../package'
import Store from './store'
import yargs from 'yargs'
import { START } from './actions'
import { logError, logHint } from './log'

const { argv } = yargs
  .boolean('doc')
  .boolean('release')
  .default('release', true)
  .boolean('verbose')
  .help(false)
  .version(Package.version)

logHint(`${Package.name} v${Package.version}\n`)

Store
  .dispatch(START)(argv)
  .catch((e) => {
    logError(e)

    return setTimeout(() => {
      throw 1
    }, 0)
  })
