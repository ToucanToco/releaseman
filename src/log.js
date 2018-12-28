import flow from 'lodash/fp/flow'
import padChars from 'lodash/fp/padChars'
import padCharsEnd from 'lodash/fp/padCharsEnd'
import replace from 'lodash/fp/replace'
import upperCase from 'lodash/fp/upperCase'

const _logColor = (color) => (message) => (
  // eslint-disable-next-line no-console
  console.log(`${color}%s\x1b[0m`, message)
)

const log = _logColor('\x1b[0m')
const logError = _logColor('\x1b[31m')
const logHint = _logColor('\x1b[2m')
const logInfo = _logColor('\x1b[36m')
const logSuccess = _logColor('\x1b[32m')
const logWarn = _logColor('\x1b[33m')

const logAction = (position) => (action) => {
  const actionName = flow(
    replace('RUN_')(''),
    upperCase
  )(action)

  const logPad = padChars('#')(79)(`### ${position} ${actionName} SCRIPT ###`)

  return log(`${logPad}\n`)
}
const logTaskStart = (description) => log(
  padCharsEnd('*')(79)(`TASK: [${description}] ***`)
)

const logActionEnd = logAction('END')
const logActionStart = logAction('START')

export {
  log,
  logAction,
  logActionEnd,
  logActionStart,
  logError,
  logHint,
  logInfo,
  logSuccess,
  logTaskStart,
  logWarn
}
