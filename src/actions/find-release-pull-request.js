import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const FIND_RELEASE_PULL_REQUEST = 'FIND_RELEASE_PULL_REQUEST'

const findReleasePullRequest = async ({
  commit,
  getters,
  state
}, isSkipped) => {
  logTaskStart('Find release pull request')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Searching pull request for \`${
    state.data.head
  }\` into \`${
    state.data.base
  }\`...`)

  const { number } = await getters.query('pullRequests.find')({
    base: state.data.base,
    head: state.data.head
  })

  logInfo(number)

  return commit(ASSIGN_DATA, { number: number })
}

export { FIND_RELEASE_PULL_REQUEST }
export default findReleasePullRequest
