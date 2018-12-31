import { logInfo, logTaskStart } from '../log'

const UPDATE_PULL_REQUEST = 'UPDATE_PULL_REQUEST'

const updatePullRequest = async ({ getters, state }, isSkipped) => {
  logTaskStart('Update pull request')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Updating pull request #${state.data.number}...`)

  const { url } = await getters.github.pullRequests.update({
    changelog: state.data.changelog.text,
    name: state.data.name,
    number: state.data.number
  })

  return logInfo(url)
}

export { UPDATE_PULL_REQUEST }
export default updatePullRequest
