import map from 'lodash/fp/map'
import reject from 'lodash/fp/reject'
import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const CREATE_LABELS = 'CREATE_LABELS'

const createLabels = async ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Create labels')

  if (isSkipped) {
    return undefined
  }

  logInfo('Creating labels...')

  return Promise.all(
    map(async (label) => {
      const { name, url } = await getters.query('labels.create')(label)

      logInfo(`${name}: ${url}`)

      return commit(ASSIGN_DATA, {
        labels: reject(['name', name])(state.data.labels)
      })
    })(state.data.labels)
  )
}

export { CREATE_LABELS }
export default createLabels
