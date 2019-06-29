import { logInfo, logWarn } from '../log'

const MERGE_PULL_REQUEST = 'MERGE_PULL_REQUEST'

const mergePullRequest = ({ getters }) => async ({
  message,
  method,
  number
}) => {
  logInfo(`Merging pull request #${number}...`)

  const { isMergeable, isMerged } = await getters.query('pulls.get')({ number })

  if (isMerged) {
    return logWarn('Pull request already merged.')
  }
  if (!isMergeable) {
    throw 'Pull request non-mergeable!'
  }

  const { url } = await getters.query('pulls.merge')({
    message,
    method,
    number
  })

  return logInfo(url)
}

export { MERGE_PULL_REQUEST }
export default mergePullRequest
