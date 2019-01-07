import {
  RUN_FEATURE_FINISH,
  RUN_FEATURE_PUBLISH,
  RUN_FEATURE_START
} from '../actions'

const RUN_FEATURE = 'RUN_FEATURE'

const runFeature = ({ dispatch, state }) => () => {
  switch (state.config.position) {
    case 'finish':
      return dispatch(RUN_FEATURE_FINISH)()
    case 'publish':
      return dispatch(RUN_FEATURE_PUBLISH)()
    case 'start':
      return dispatch(RUN_FEATURE_START)()
    default:
      throw (
        'The `feature` command must be run in start, publish or finish mode!'
      )
  }
}

export { RUN_FEATURE }
export default runFeature
