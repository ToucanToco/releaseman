import map from 'lodash/fp/map'
import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'
import { toReadableList } from '../helpers'

const GET_PULL_REQUEST_LABELS = 'GET_PULL_REQUEST_LABELS'

const getPullRequestLabels = ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Get pull request labels')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Retrieving pull request #${state.data.number}'s labels...`)

  return getters.github.pullRequests.getLabels({ number: state.data.number })
    .then((labels) => {
      logInfo(toReadableList(map('name')(labels)))

      return commit(ASSIGN_DATA, { labels: labels })
    })
}

export { GET_PULL_REQUEST_LABELS }
export default getPullRequestLabels
