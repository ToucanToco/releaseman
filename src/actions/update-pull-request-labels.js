import { toReadableList } from '../helpers'
import { logInfo } from '../log'

const UPDATE_PULL_REQUEST_LABELS = 'UPDATE_PULL_REQUEST_LABELS'

const updatePullRequestLabels = ({ getters }) => async ({ labels, number }) => {
  logInfo(`Setting pull request #${number} labels to ${
    toReadableList(labels)
  }...`)

  const { url } = await getters.query('pulls.setLabels')({
    labels,
    number
  })

  return logInfo(url)
}

export { UPDATE_PULL_REQUEST_LABELS }
export default updatePullRequestLabels
