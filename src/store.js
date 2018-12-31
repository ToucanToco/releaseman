import actions, { RUN_TASK, SKIP_TASK } from './actions'
import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import includes from 'lodash/fp/includes'
import isEqual from 'lodash/fp/isEqual'
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
  commit: (mutation, payload) => (
    get(mutation)(Store.mutations)(Store.state, payload)
  ),
  dispatch: async (action, payload) => (
    get(action)(Store.actions)(Store, payload)
  ),
  getters: {
    configError: (...keys) => flow(
      map((key) => `The <${key}> param is mandatory!`),
      join('\n')
    )(keys),
    github: null,
    isCurrentTaskIndex: isEqual(0),
    runOrSkip: (...indexes) => (name) => Store.dispatch((
      includes(0)(indexes)
        ? RUN_TASK
        : SKIP_TASK
    ), {
      index: last(indexes),
      name: name
    })
  },
  mutations: mutations,
  state: {
    config: null,
    data: null,
    taskIndex: 0
  }
}

export {
  ACTIONS,
  STATE_FILE_PATH
}
export default Store
