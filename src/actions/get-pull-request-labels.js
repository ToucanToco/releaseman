import map from 'lodash/fp/map'
import { logInfo, logTaskStart } from '../log'
import { toReadableList } from '../helpers'

const GET_PULL_REQUEST_LABELS = 'GET_PULL_REQUEST_LABELS'

const getPullRequestLabels = ({ getters }) => async ({ isSkipped, number }) => {
  logTaskStart('Get pull request labels')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Retrieving pull request #${number}'s labels...`)

  const labels = await getters.query('pullRequests.getLabels')({
    number: number
  })

  logInfo(toReadableList(map('name')(labels)))

  return labels
}

export { GET_PULL_REQUEST_LABELS }
export default getPullRequestLabels
