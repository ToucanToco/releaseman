import kebabCase from 'lodash/fp/kebabCase'
import { CREATE_BRANCH } from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_HOTFIX_START = 'RUN_HOTFIX_START'

const runHotfixStart = ({ getters, state }) => async () => {
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

  await getters.runOrSkip(0)(CREATE_BRANCH)({
    base: state.config.branches.master,
    head: `${
      state.config.isDoc
        ? state.config.branches.doc
        : state.config.branches.hotfix
    }${kebabCase(state.config.name)}`
  })

  return logActionEnd(RUN_HOTFIX_START)
}

export { RUN_HOTFIX_START }
export default runHotfixStart
