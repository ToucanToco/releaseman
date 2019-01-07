import isEmpty from 'lodash/fp/isEmpty'
import map from 'lodash/fp/map'
import { logInfo, logTaskStart } from '../log'
import { toReadableList } from '../helpers'

const GET_LABELS = 'GET_LABELS'

const getLabels = ({ getters }) => async ({ isSkipped }) => {
  logTaskStart('Get labels')

  if (isSkipped) {
    return undefined
  }

  logInfo('Retrieving labels...')

  const labels = await getters.query('labels.index')()

  logInfo(
    isEmpty(labels)
      ? 'No labels'
      : toReadableList(map('name')(labels))
  )

  return labels
}

export { GET_LABELS }
export default getLabels
