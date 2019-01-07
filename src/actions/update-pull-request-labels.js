import { toReadableList } from '../helpers'
import { logInfo, logTaskStart } from '../log'

const UPDATE_PULL_REQUEST_LABELS = 'UPDATE_PULL_REQUEST_LABELS'

const updatePullRequestLabels = ({ getters }) => async ({
  isSkipped,
  labels,
  number
}) => {
  logTaskStart('Update pull request labels')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Setting pull request #${number} labels to ${
    toReadableList(labels)
  }...`)

  const { url } = await getters.query('pullRequests.setLabels')({
    labels: labels,
    number: number
  })

  return logInfo(url)
}

export { UPDATE_PULL_REQUEST_LABELS }
export default updatePullRequestLabels
