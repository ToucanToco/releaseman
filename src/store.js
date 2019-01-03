import actions, { RUN_TASK, SKIP_TASK } from './actions'
import filter from 'lodash/fp/filter'
import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import includes from 'lodash/fp/includes'
import isEmpty from 'lodash/fp/isEmpty'
import isUndefined from 'lodash/fp/isUndefined'
import join from 'lodash/fp/join'
import last from 'lodash/fp/last'
import map from 'lodash/fp/map'
import mutations from './mutations'

const ACTIONS = {
  CHANGES: 'changes',
  CONTINUE: 'continue',
  FEATURE: 'feature',
  FIX: 'fix',
  HELP: 'help',
  HOTFIX: 'hotfix',
  INIT: 'init',
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
    matchesTaskIndex: (...indexes) => includes(Store.state.taskIndex)(indexes),
    query: (path) => (payload) => get(path)(Store.getters.github)(payload),
    runOrSkip: (...indexes) => (action) => (payload) => Store.dispatch((
      Store.getters.matchesTaskIndex(...indexes)
        ? RUN_TASK
        : SKIP_TASK
    ))({
      action: action,
      index: last(indexes),
      payload: payload
    }),
    validateConfig: (...keys) => {
      const error = flow(
        filter((key) => isUndefined(get(key)(Store.state.config))),
        map((key) => `The <${key}> param is mandatory!`),
        join('\n')
      )(keys)

      if (isEmpty(error)) {
        return undefined
      }

      throw error
    }
  },
  mutations: mutations,
  state: {
    config: {},
    data: {},
    taskIndex: 0
  }
}

export {
  ACTIONS,
  STATE_FILE_PATH
}
export default Store
