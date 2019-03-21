import isUndefined from 'lodash/fp/isUndefined'
import { logInfo, logTaskStart, logWarn } from '../log'

const FIND_PULL_REQUEST = 'FIND_PULL_REQUEST'

const findPullRequest = ({ getters }) => async ({
  base,
  head,
  isSkipped
}) => {
  logTaskStart('Find pull request')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Searching pull request for \`${head}\` into \`${base}\`...`)

  const pullRequest = await getters.query('pullRequests.find')({
    base: base,
    head: head
  })

  if (isUndefined(pullRequest)) {
    return logWarn('Not Found')
  }

  logInfo(pullRequest.number)

  return pullRequest
}

export { FIND_PULL_REQUEST }
export default findPullRequest
