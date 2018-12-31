import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const CREATE_PULL_REQUEST = 'CREATE_PULL_REQUEST'

const createPullRequest = async ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Create pull request')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Creating pull request for \`${
    state.data.head
  }\` into \`${
    state.data.base
  }\`...`)

  const { number, url } = await getters.query('pullRequests.create')({
    base: state.data.base,
    changelog: state.data.changelog.text,
    head: state.data.head,
    name: state.data.name
  })

  logInfo(url)

  return commit(ASSIGN_DATA, { number: number })
}

export { CREATE_PULL_REQUEST }
export default createPullRequest
