import {
  DELETE_BRANCH,
  GET_PULL_REQUEST,
  MERGE_PULL_REQUEST,
  STABLE_AUTO_FIX
} from '../actions'
import { logCommandEnd, logCommandStart } from '../log'

const STABLE_FIX = 'STABLE_FIX'

const stableFix = ({ dispatch, getters, state }) => async () => {
  logCommandStart(STABLE_FIX)
  getters.validateConfig(
    'branches.master',
    'number'
  )

  const pull = await getters.runOrSkip(0)(GET_PULL_REQUEST)({
    number: state.config.number
  })
  if (pull.base !== state.config.branches.master) {
    throw `A hotfix cannot be merged into \`${pull.base}\`!`
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
  await dispatch(STABLE_AUTO_FIX)({ index: 2 })

  return logCommandEnd(STABLE_FIX)
}

export { STABLE_FIX }
export default stableFix
