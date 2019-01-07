import { logInfo, logTaskStart, logWarn } from '../log'

const MERGE_PULL_REQUEST = 'MERGE_PULL_REQUEST'

const mergePullRequest = ({ getters }) => async ({
  isMergeable,
  isMerged,
  isSkipped,
  message,
  method,
  number
}) => {
  logTaskStart('Merge pull request')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Merging pull request #${number}...`)

  if (isMerged) {
    return logWarn('Pull request already merged.')
  }
  if (!isMergeable) {
    throw 'Pull request non-mergeable!'
  }

  const { url } = await getters.query('pullRequests.merge')({
    message: message,
    method: method,
    number: number
  })

  return logInfo(url)
}

export { MERGE_PULL_REQUEST }
export default mergePullRequest
