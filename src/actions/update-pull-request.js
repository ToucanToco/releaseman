import { logInfo, logTaskStart } from '../log'

const UPDATE_PULL_REQUEST = 'UPDATE_PULL_REQUEST'

const updatePullRequest = ({ getters, state }, isSkipped) => {
  logTaskStart('Update pull request')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Updating pull request #${state.data.number}...`)

  return getters.github.pullRequests.update({
    changelog: state.data.changelog.text,
    name: state.data.name,
    number: state.data.number
  })
    .then(({ url }) => logInfo(url))
}

export { UPDATE_PULL_REQUEST }
export default updatePullRequest
