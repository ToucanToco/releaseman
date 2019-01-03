import kebabCase from 'lodash/fp/kebabCase'
import { CREATE_BRANCH } from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_FEATURE_START = 'RUN_FEATURE_START'

const runFeatureStart = ({ getters, state }) => async () => {
  logActionStart(RUN_FEATURE_START)
  getters.validateConfig(
    'branches.develop',
    (
      state.config.isDoc
        ? 'branches.doc'
        : 'branches.feature'
    ),
    'name'
  )

  await getters.runOrSkip(0, 1)(CREATE_BRANCH)({
    base: state.config.branches.develop,
    head: `${
      state.config.isDoc
        ? state.config.branches.doc
        : state.config.branches.feature
    }${kebabCase(state.config.name)}`
  })

  return logActionEnd(RUN_FEATURE_START)
}

export { RUN_FEATURE_START }
export default runFeatureStart
