import includes from 'lodash/fp/includes'
import { ACTIONS } from '../store'
import {
  RUN_CHANGES,
  RUN_CONTINUE,
  RUN_FEATURE,
  RUN_FIX,
  RUN_HELP,
  RUN_HOTFIX,
  RUN_INIT,
  RUN_RELEASE
} from '../actions'

const RUN = 'RUN'

const run = async ({ dispatch, getters, state }) => {
  if (!includes(state.config.action)([
    ACTIONS.CONTINUE, ACTIONS.HELP, undefined
  ])) {
    getters.validateConfig(
      'owner',
      'repo',
      'token'
    )
  }
  switch (state.config.action) {
    case ACTIONS.CHANGES:
      return dispatch(RUN_CHANGES)
    case ACTIONS.CONTINUE:
      return dispatch(RUN_CONTINUE)
    case ACTIONS.FEATURE:
      return dispatch(RUN_FEATURE)
    case ACTIONS.FIX:
      return dispatch(RUN_FIX)
    case ACTIONS.HELP:
      return dispatch(RUN_HELP)
    case ACTIONS.HOTFIX:
      return dispatch(RUN_HOTFIX)
    case ACTIONS.INIT:
      return dispatch(RUN_INIT)
    case ACTIONS.RELEASE:
      return dispatch(RUN_RELEASE)
    default:
      return dispatch(RUN_HELP)
  }
}

export { RUN }
export default run
