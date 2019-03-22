import { logInfo, logTaskStart } from '../log'

const CLOSE_PULL_REQUEST = 'CLOSE_PULL_REQUEST'

const closePullRequest = ({ getters }) => async ({ isSkipped, number }) => {
  logTaskStart('Close pull request')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Closing pull request #${number}...`)

  await getters.query('pullRequests.close')({ number: number })

  return undefined
}

export { CLOSE_PULL_REQUEST }
export default closePullRequest
