import {
  RUN_FIX_FINISH,
  RUN_FIX_PUBLISH,
  RUN_FIX_START
} from '../actions'

const RUN_FIX = 'RUN_FIX'

const runFix = ({ dispatch, state }) => () => {
  switch (state.config.position) {
    case 'finish':
      return dispatch(RUN_FIX_FINISH)
    case 'publish':
      return dispatch(RUN_FIX_PUBLISH)
    case 'start':
      return dispatch(RUN_FIX_START)
    default:
      throw 'The `fix` command must be run in start, publish or finish mode!'
  }
}

export { RUN_FIX }
export default runFix
