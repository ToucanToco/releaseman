import {
  GET_BRANCH,
  STABLE_AUTO_FIX,
  STABLE_AUTO_RELEASE
} from '../actions'
import { logCommandEnd, logCommandStart, logInfo } from '../log'

const STABLE_AUTO = 'STABLE_AUTO'

const stableAuto = ({ dispatch, getters, state }) => async () => {
  logCommandStart(STABLE_AUTO)
  getters.validateConfig('branches.master')

  const branch = await getters.runOrSkip(0)(GET_BRANCH)({
    name: state.config.branches.master
  })
  const releaseNameMatch = new RegExp('^Release :: (.*?) \\(#\\d+\\)$')
    .exec(branch.message)
  const isHotfix = new RegExp('^Hotfix :: .*? \\(#\\d+\\)$')
    .test(branch.message)

  if (releaseNameMatch !== null) {
    logInfo('New stable release.\n')

    await dispatch(STABLE_AUTO_RELEASE)({
      index: 0,
      name: releaseNameMatch[1]
    })
  } else if (isHotfix) {
    logInfo('New hotfix.\n')

    await dispatch(STABLE_AUTO_FIX)({ index: 0 })
  } else {
    logInfo('Not a new stable release or hotfix. Skipped.\n')
  }

  return logCommandEnd(STABLE_AUTO)
}

export { STABLE_AUTO }
export default stableAuto
