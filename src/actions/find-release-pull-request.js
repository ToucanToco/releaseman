import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const FIND_RELEASE_PULL_REQUEST = 'FIND_RELEASE_PULL_REQUEST'

const findReleasePullRequest = ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Find release pull request')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Searching pull request for \`${
    state.data.head
  }\` into \`${
    state.data.base
  }\`...`)

  return getters.github.pullRequests.find({
    base: state.data.base,
    head: state.data.head
  })
    .then(({ number }) => {
      logInfo(number)

      return commit(ASSIGN_DATA, { number: number })
    })
}

export { FIND_RELEASE_PULL_REQUEST }
export default findReleasePullRequest
