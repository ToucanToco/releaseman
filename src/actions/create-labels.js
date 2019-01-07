import map from 'lodash/fp/map'
import { logInfo, logTaskStart } from '../log'

const CREATE_LABELS = 'CREATE_LABELS'

const createLabels = ({ getters }) => async ({ isSkipped, labels }) => {
  logTaskStart('Create labels')

  if (isSkipped) {
    return undefined
  }

  logInfo('Creating labels...')

  const createdLabels = await Promise.all(
    map(async (label) => {
      const createdLabel = await getters.query('labels.create')(label)

      logInfo(`${createdLabel.name}: ${createdLabel.url}`)

      return createdLabel
    })(labels)
  )

  return createdLabels
}

export { CREATE_LABELS }
export default createLabels
