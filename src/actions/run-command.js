import { COMMANDS, MODES } from '../store'
import {
  ALPHA_AUTO,
  ALPHA_FIX,
  ALPHA_RELEASE,
  BETA_AUTO,
  BETA_FIX,
  BETA_RELEASE,
  COMPARE,
  GET_HELP,
  RUN_CONTINUE,
  STABLE_AUTO,
  STABLE_FIX,
  STABLE_RELEASE
} from '../actions'

const RUN_COMMAND = 'RUN_COMMAND'

const runCommand = ({ dispatch, getters, state }) => () => {
  if (![
    COMMANDS.CONTINUE, COMMANDS.HELP, undefined
  ].includes(state.config.command)) {
    getters.validateConfig(
      'owner',
      'repo',
      'token'
    )
  }
  switch (state.config.command) {
    case COMMANDS.ALPHA:
      switch (state.config.mode) {
        case MODES.AUTO:
          return dispatch(ALPHA_AUTO)()
        case MODES.FIX:
          return dispatch(ALPHA_FIX)()
        case MODES.RELEASE:
          return dispatch(ALPHA_RELEASE)()
        default:
          throw 'The `alpha` command must be run in auto, fix or release mode!'
      }
    case COMMANDS.BETA:
      switch (state.config.mode) {
        case MODES.AUTO:
          return dispatch(BETA_AUTO)()
        case MODES.FIX:
          return dispatch(BETA_FIX)()
        case MODES.RELEASE:
          return dispatch(BETA_RELEASE)()
        default:
          throw 'The `beta` command must be run in auto, fix or release mode!'
      }
    case COMMANDS.COMPARE:
      return dispatch(COMPARE)()
    case COMMANDS.CONTINUE:
      return dispatch(RUN_CONTINUE)()
    case COMMANDS.HELP:
      return dispatch(GET_HELP)()
    case COMMANDS.STABLE:
      switch (state.config.mode) {
        case MODES.AUTO:
          return dispatch(STABLE_AUTO)()
        case MODES.FIX:
          return dispatch(STABLE_FIX)()
        case MODES.HOTFIX:
          return dispatch(STABLE_FIX)()
        case MODES.RELEASE:
          return dispatch(STABLE_RELEASE)()
        default:
          throw (
            'The `stable` command must be run in auto, (hot)fix or release ' +
            'mode!'
          )
      }
    default:
      return dispatch(GET_HELP)()
  }
}

export { RUN_COMMAND }
export default runCommand
