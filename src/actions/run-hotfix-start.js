import isEmpty from 'lodash/fp/isEmpty'
import kebabCase from 'lodash/fp/kebabCase'
import { SET_DATA } from '../mutations'
import { CREATE_BRANCH } from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_HOTFIX_START = 'RUN_HOTFIX_START'

const runHotfixStart = ({ commit, getters, state }) => {
  logActionStart(RUN_HOTFIX_START)

  const configError = getters.configError(
    (
      state.config.isDoc
        ? 'branches.doc'
        : 'branches.hotfix'
    ),
    'branches.master',
    'name'
  )

  if (!isEmpty(configError)) {
    return Promise.reject(configError)
  }
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

  return getters.runOrSkip(0, 1)(CREATE_BRANCH)
    .then(() => logActionEnd(RUN_HOTFIX_START))
}

export { RUN_HOTFIX_START }
export default runHotfixStart
