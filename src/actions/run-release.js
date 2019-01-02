import { RUN_RELEASE_FINISH, RUN_RELEASE_START } from '../actions'

const RUN_RELEASE = 'RUN_RELEASE'

const runRelease = ({ dispatch, state }) => () => {
  switch (state.config.position) {
    case 'finish':
      return dispatch(RUN_RELEASE_FINISH)
    case 'start':
      return dispatch(RUN_RELEASE_START)
    default:
      throw 'The `release` command must be run in start or finish mode!'
  }
}

export { RUN_RELEASE }
export default runRelease
