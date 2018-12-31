import kebabCase from 'lodash/fp/kebabCase'
import { SET_DATA } from '../mutations'
import { CREATE_BRANCH } from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_HOTFIX_START = 'RUN_HOTFIX_START'

const runHotfixStart = async ({ commit, getters, state }) => {
  logActionStart(RUN_HOTFIX_START)
  getters.validateConfig(
    (
      state.config.isDoc
        ? 'branches.doc'
        : 'branches.hotfix'
    ),
    'branches.master',
    'name'
  )

  if (getters.isCurrentTaskIndex(0)) {
    commit(SET_DATA, {
      base: state.config.branches.master,
      head: `${
        state.config.isDoc
          ? state.config.branches.doc
          : state.config.branches.hotfix
      }${kebabCase(state.config.name)}`
    })
  }

  await getters.runOrSkip(0, 1)(CREATE_BRANCH)

  return logActionEnd(RUN_HOTFIX_START)
}

export { RUN_HOTFIX_START }
export default runHotfixStart
