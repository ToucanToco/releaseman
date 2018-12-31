import kebabCase from 'lodash/fp/kebabCase'
import { ASSIGN_DATA, SET_DATA } from '../mutations'
import { CREATE_BRANCH, GET_RELEASE_BRANCH } from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_FIX_START = 'RUN_FIX_START'

const runFixStart = async ({ commit, getters, state }) => {
  logActionStart(RUN_FIX_START)
  getters.validateConfig(
    (
      state.config.isDoc
        ? 'branches.doc'
        : 'branches.fix'
    ),
    'branches.release',
    'name',
    'tag'
  )

  if (getters.isCurrentTaskIndex(0)) {
    commit(SET_DATA, {})
  }

  await getters.runOrSkip(0, 1)(GET_RELEASE_BRANCH)

  if (getters.isCurrentTaskIndex(1)) {
    commit(ASSIGN_DATA, {
      base: state.data.branch,
      head: `${
        state.config.isDoc
          ? state.config.branches.doc
          : state.config.branches.fix
      }${kebabCase(state.config.name)}`
    })
  }

  await getters.runOrSkip(1, 2)(CREATE_BRANCH)

  return logActionEnd(RUN_FIX_START)
}

export { RUN_FIX_START }
export default runFixStart
