import { logInfo, logTaskStart, logWarn } from '../log'

const MERGE_PULL_REQUEST = 'MERGE_PULL_REQUEST'

const mergePullRequest = async ({ getters, state }, isSkipped) => {
  logTaskStart('Merge pull request')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Merging pull request #${state.data.number}...`)

  if (state.data.isMerged) {
    return logWarn('Pull request already merged.')
  }
  if (!state.data.isMergeable) {
    throw 'Pull request non-mergeable!'
  }

  const { url } = await getters.query('pullRequests.merge')({
    message: state.data.message,
    method: state.data.method,
    number: state.data.number
  })

  return logInfo(url)
}

export { MERGE_PULL_REQUEST }
export default mergePullRequest
