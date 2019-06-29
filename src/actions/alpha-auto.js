import {
  ALPHA_AUTO_FIX,
  ALPHA_AUTO_RELEASE,
  GET_BRANCH
} from '../actions'
import { logCommandEnd, logCommandStart, logInfo } from '../log'

const ALPHA_AUTO = 'ALPHA_AUTO'

const alphaAuto = ({ dispatch, getters, state }) => async () => {
  logCommandStart(ALPHA_AUTO)
  getters.validateConfig('branches.alpha')

  const branch = await getters.runOrSkip(0)(GET_BRANCH)({
    name: state.config.branches.alpha
  })
  const releaseNameMatch = new RegExp('^Release :: (.*?) alpha \\(#\\d+\\)$')
    .exec(branch.message)
  const isFix = new RegExp('^Fix :: .*? \\(#\\d+\\)$')
    .test(branch.message)

  if (releaseNameMatch !== null) {
    logInfo('New alpha release.\n')

    await dispatch(ALPHA_AUTO_RELEASE)({
      index: 0,
      name: releaseNameMatch[1]
    })
  } else if (isFix) {
    logInfo('New fix on alpha.\n')

    await dispatch(ALPHA_AUTO_FIX)({ index: 0 })
  } else {
    logInfo('Not a new alpha release or fix. Skipped.\n')
  }

  return logCommandEnd(ALPHA_AUTO)
}

export { ALPHA_AUTO }
export default alphaAuto
