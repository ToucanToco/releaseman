import {
  BETA_AUTO_FIX,
  BETA_AUTO_RELEASE,
  GET_BRANCH
} from '../actions'
import { logCommandEnd, logCommandStart, logInfo } from '../log'

const BETA_AUTO = 'BETA_AUTO'

const betaAuto = ({ dispatch, getters, state }) => async () => {
  logCommandStart(BETA_AUTO)
  getters.validateConfig('branches.beta')

  const branch = await getters.runOrSkip(0)(GET_BRANCH)({
    name: state.config.branches.beta
  })
  const releaseNameMatch = new RegExp('^Release :: (.*?) beta \\(#\\d+\\)$')
    .exec(branch.message)
  const isFix = new RegExp('^Fix :: .*? \\(#\\d+\\)$')
    .test(branch.message)

  if (releaseNameMatch !== null) {
    logInfo('New beta release.\n')

    await dispatch(BETA_AUTO_RELEASE)({
      index: 0,
      name: releaseNameMatch[1]
    })
  } else if (isFix) {
    logInfo('New fix on beta.\n')

    await dispatch(BETA_AUTO_FIX)({ index: 0 })
  } else {
    logInfo('Not a new beta release or fix. Skipped.\n')
  }

  return logCommandEnd(BETA_AUTO)
}

export { BETA_AUTO }
export default betaAuto
