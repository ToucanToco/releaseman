import kebabCase from 'lodash/fp/kebabCase'
import { CREATE_BRANCH, GET_RELEASE_BRANCH } from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_FIX_START = 'RUN_FIX_START'

const runFixStart = ({ getters, state }) => async () => {
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

  const releaseBranch = await getters.runOrSkip(0)(GET_RELEASE_BRANCH)()
  await getters.runOrSkip(1)(CREATE_BRANCH)({
    base: releaseBranch.name,
    head: `${
      state.config.isDoc
        ? state.config.branches.doc
        : state.config.branches.fix
    }${kebabCase(state.config.name)}`
  })

  return logActionEnd(RUN_FIX_START)
}

export { RUN_FIX_START }
export default runFixStart
