import {
  BETA_AUTO_FIX,
  DELETE_BRANCH,
  GET_PULL_REQUEST,
  MERGE_PULL_REQUEST
} from '../actions'
import { logCommandEnd, logCommandStart } from '../log'

const BETA_FIX = 'BETA_FIX'

const betaFix = ({ dispatch, getters, state }) => async () => {
  logCommandStart(BETA_FIX)
  getters.validateConfig(
    'branches.beta',
    'number'
  )

  const pull = await getters.runOrSkip(0)(GET_PULL_REQUEST)({
    number: state.config.number
  })
  if (pull.base !== state.config.branches.beta) {
    throw `A beta fix cannot be merged into \`${pull.base}\`!`
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
  await dispatch(BETA_AUTO_FIX)({ index: 2 })

  return logCommandEnd(BETA_FIX)
}

export { BETA_FIX }
export default betaFix
