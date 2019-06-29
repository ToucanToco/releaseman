import { logInfo, logWarn } from '../log'

const GET_PULL_REQUEST = 'GET_PULL_REQUEST'

const getPullRequest = ({ getters }) => async ({ number }) => {
  logInfo(`Retrieving pull request #${number}...`)

  const pull = await getters.query('pulls.get')({ number })

  if (pull === undefined) {
    return logWarn('Not Found')
  }

  logInfo(pull.number)
  logInfo(pull.url)

  return pull
}

export { GET_PULL_REQUEST }
export default getPullRequest
