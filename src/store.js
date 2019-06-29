import actions, { RUN_TASK, SKIP_TASK } from './actions'
import get from 'lodash/fp/get'
import mutations from './mutations'
import { logTaskStart } from './log'

const COMMANDS = {
  ALPHA: 'alpha',
  BETA: 'beta',
  COMPARE: 'compare',
  CONTINUE: 'continue',
  HELP: 'help',
  STABLE: 'stable'
}
const MODES = {
  AUTO: 'auto',
  FIX: 'fix',
  HOTFIX: 'hotfix',
  RELEASE: 'release'
}
const STATE_FILE_PATH = `${__dirname}/state.json`

const Store = {
  actions: actions,
  commit: (mutation) => (payload) => (
    get(mutation)(Store.mutations)(Store.state)(payload)
  ),
  dispatch: (action) => async (payload) => (
    get(action)(Store.actions)(Store)(payload)
  ),
  getters: {
    github: null,
    query: (path) => (payload) => get(path)(Store.getters.github)(payload),
    runOrSkip: (index) => (action) => (payload) => {
      logTaskStart(action)

      return Store.dispatch(
        index >= Store.state.taskIndex
          ? RUN_TASK
          : SKIP_TASK
      )({
        action,
        index,
        payload
      })
    },
    validateConfig: (...keys) => {
      const error = keys.filter((key) => (
        get(key)(Store.state.config) === undefined
      ))
        .map((key) => `The <${key}> param is mandatory!`)
        .join('\n')

      if (error.length === 0) {
        return undefined
      }

      throw error
    }
  },
  mutations: mutations,
  state: {
    config: {},
    data: {},
    taskIndex: -1
  }
}

export {
  COMMANDS,
  MODES,
  STATE_FILE_PATH
}
export default Store
