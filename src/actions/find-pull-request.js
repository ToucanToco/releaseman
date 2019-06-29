import { logInfo, logWarn } from '../log'

const FIND_PULL_REQUEST = 'FIND_PULL_REQUEST'

const findPullRequest = ({ getters }) => async ({ base, head }) => {
  logInfo(`Searching pull request for \`${head}\` into \`${base}\`...`)

  const pull = await getters.query('pulls.find')({
    base: base,
    head: head
  })

  if (pull === undefined) {
    return logWarn('Not Found')
  }

  logInfo(pull.number)
  logInfo(pull.url)

  return pull
}

export { FIND_PULL_REQUEST }
export default findPullRequest
