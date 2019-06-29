import {
  ALPHA_AUTO_FIX,
  DELETE_BRANCH,
  GET_PULL_REQUEST,
  MERGE_PULL_REQUEST
} from '../actions'
import { logCommandEnd, logCommandStart } from '../log'

const ALPHA_FIX = 'ALPHA_FIX'

const alphaFix = ({ dispatch, getters, state }) => async () => {
  logCommandStart(ALPHA_FIX)
  getters.validateConfig(
    'branches.alpha',
    'number'
  )

  const pull = await getters.runOrSkip(0)(GET_PULL_REQUEST)({
    number: state.config.number
  })
  if (pull.base !== state.config.branches.alpha) {
    throw `An alpha fix cannot be merged into \`${pull.base}\`!`
  }
  await getters.runOrSkip(1)(MERGE_PULL_REQUEST)({
    isMergeable: pull.isMergeable,
    isMerged: pull.isMerged,
    message: `${pull.name} (#${state.config.number})`,
    method: 'squash',
    number: state.config.number
  })
  await getters.runOrSkip(2)(DELETE_BRANCH)({
    name: pull.head
  })
  await dispatch(ALPHA_AUTO_FIX)({ index: 2 })

  return logCommandEnd(ALPHA_FIX)
}

export { ALPHA_FIX }
export default alphaFix
