import {
  FIND_PULL_REQUEST,
  GET_CHANGELOG,
  MERGE_BRANCHES,
  UPDATE_PULL_REQUEST
} from '../actions'

const ALPHA_AUTO_FIX = 'ALPHA_AUTO_FIX'

const alphaAutoFix = ({ getters, state }) => async ({ index }) => {
  getters.validateConfig(
    'branches.alpha',
    'branches.beta',
    'branches.develop',
    'categories'
  )

  const pull = await getters.runOrSkip(index + 1)(FIND_PULL_REQUEST)({
    base: state.config.branches.beta,
    head: state.config.branches.alpha
  })

  if (pull !== undefined) {
    const changelog = await getters.runOrSkip(index + 2)(GET_CHANGELOG)({
      base: state.config.branches.beta,
      head: state.config.branches.alpha
    })
    await getters.runOrSkip(index + 3)(UPDATE_PULL_REQUEST)({
      message: changelog.message,
      number: pull.number
    })
  }

  await getters.runOrSkip(index + 4)(MERGE_BRANCHES)({
    base: state.config.branches.develop,
    head: state.config.branches.alpha
  })

  return index + 4
}

export { ALPHA_AUTO_FIX }
export default alphaAutoFix
