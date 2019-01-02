import {
  RUN_HOTFIX_FINISH,
  RUN_HOTFIX_PUBLISH,
  RUN_HOTFIX_START
} from '../actions'

const RUN_HOTFIX = 'RUN_HOTFIX'

const runHotfix = ({ dispatch, state }) => () => {
  switch (state.config.position) {
    case 'finish':
      return dispatch(RUN_HOTFIX_FINISH)
    case 'publish':
      return dispatch(RUN_HOTFIX_PUBLISH)
    case 'start':
      return dispatch(RUN_HOTFIX_START)
    default:
      throw 'The `hotfix` command must be run in start, publish or finish mode!'
  }
}

export { RUN_HOTFIX }
export default runHotfix
