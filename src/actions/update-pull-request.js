import { logInfo, logTaskStart } from '../log'

const UPDATE_PULL_REQUEST = 'UPDATE_PULL_REQUEST'

const updatePullRequest = ({ getters }) => async ({
  changelog,
  isSkipped,
  name,
  number
}) => {
  logTaskStart('Update pull request')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Updating pull request #${number}...`)

  const { url } = await getters.query('pullRequests.update')({
    changelog: changelog,
    name: name,
    number: number
  })

  return logInfo(url)
}

export { UPDATE_PULL_REQUEST }
export default updatePullRequest
