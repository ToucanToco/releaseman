import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const CREATE_PULL_REQUEST = 'CREATE_PULL_REQUEST'

const createPullRequest = ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Create pull request')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Creating pull request for \`${
    state.data.head
  }\` into \`${
    state.data.base
  }\`...`)

  return getters.github.pullRequests.create({
    base: state.data.base,
    changelog: state.data.changelog.text,
    head: state.data.head,
    name: state.data.name
  })
    .then(({ number, url }) => {
      logInfo(url)

      return commit(ASSIGN_DATA, { number: number })
    })
}

export { CREATE_PULL_REQUEST }
export default createPullRequest
