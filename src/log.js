import padChars from 'lodash/fp/padChars'
import padCharsEnd from 'lodash/fp/padCharsEnd'

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

const logCommand = (position) => (command) => log(`${
  padChars('#')(79)(`### ${position} ${command.replace(/_/g, ' ')} SCRIPT ###`)
}\n`)
const logTaskStart = (task) => log(
  padCharsEnd('*')(79)(`TASK: [${task[0].toUpperCase()}${
    task.slice(1)
      .replace(/_/g, ' ')
      .toLowerCase()
  }] ***`)
)

const logCommandEnd = logCommand('END')
const logCommandStart = logCommand('START')

export {
  log,
  logCommand,
  logCommandEnd,
  logCommandStart,
  logError,
  logHint,
  logInfo,
  logSuccess,
  logTaskStart,
  logWarn
}
