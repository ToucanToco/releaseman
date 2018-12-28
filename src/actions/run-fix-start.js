import isEmpty from 'lodash/fp/isEmpty'
import kebabCase from 'lodash/fp/kebabCase'
import { ASSIGN_DATA, SET_DATA } from '../mutations'
import { CREATE_BRANCH, GET_RELEASE_BRANCH } from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_FIX_START = 'RUN_FIX_START'

const runFixStart = ({ commit, getters, state }) => {
  logActionStart(RUN_FIX_START)

  const configError = getters.configError(
    (
      state.config.isDoc
        ? 'branches.doc'
        : 'branches.fix'
    ),
    'branches.release',
    'name',
    'tag'
  )

  if (!isEmpty(configError)) {
    return Promise.reject(configError)
  }
  if (getters.isCurrentTaskIndex(0)) {
    commit(SET_DATA, {})
  }

  return getters.runOrSkip(0, 1)(GET_RELEASE_BRANCH)
    .then(() => {
      if (getters.isCurrentTaskIndex(1)) {
        return commit(ASSIGN_DATA, {
          base: state.data.branch,
          head: `${
            state.config.isDoc
              ? state.config.branches.doc
              : state.config.branches.fix
          }${kebabCase(state.config.name)}`
        })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(1, 2)(CREATE_BRANCH))
    .then(() => logActionEnd(RUN_FIX_START))
}

export { RUN_FIX_START }
export default runFixStart
