import Package from '../package'
import Store from './store'
import yargs from 'yargs'
import { logError, logHint } from './log'
import { START } from './actions'

const { argv } = yargs
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
