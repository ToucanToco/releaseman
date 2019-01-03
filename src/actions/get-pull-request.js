import { logInfo, logTaskStart } from '../log'

const GET_PULL_REQUEST = 'GET_PULL_REQUEST'

const getPullRequest = async ({ getters }) => async ({ isSkipped, number }) => {
  logTaskStart('Get pull request')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Retrieving pull request #${number}...`)

  const pullRequest = await getters.query('pullRequests.get')({
    number: number
  })

  logInfo(pullRequest.name)

  return pullRequest
}

export { GET_PULL_REQUEST }
export default getPullRequest
