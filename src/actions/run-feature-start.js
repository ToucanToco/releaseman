import isEmpty from 'lodash/fp/isEmpty'
import kebabCase from 'lodash/fp/kebabCase'
import { SET_DATA } from '../mutations'
import { CREATE_BRANCH } from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_FEATURE_START = 'RUN_FEATURE_START'

const runFeatureStart = async ({ commit, getters, state }) => {
  logActionStart(RUN_FEATURE_START)

  const configError = getters.configError(
    'branches.develop',
    (
      state.config.isDoc
        ? 'branches.doc'
        : 'branches.feature'
    ),
    'name'
  )

  if (!isEmpty(configError)) {
    throw configError
  }
  if (getters.isCurrentTaskIndex(0)) {
    commit(SET_DATA, {
      base: state.config.branches.develop,
      head: `${
        state.config.isDoc
          ? state.config.branches.doc
          : state.config.branches.feature
      }${kebabCase(state.config.name)}`
    })
  }

  await getters.runOrSkip(0, 1)(CREATE_BRANCH)

  return logActionEnd(RUN_FEATURE_START)
}

export { RUN_FEATURE_START }
export default runFeatureStart
