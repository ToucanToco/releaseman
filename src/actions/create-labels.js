import map from 'lodash/fp/map'
import reject from 'lodash/fp/reject'
import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const CREATE_LABELS = 'CREATE_LABELS'

const createLabels = ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Create labels')

  if (isSkipped) {
    return undefined
  }

  logInfo('Creating labels...')

  return Promise.all(
    map((label) => (
      getters.github.labels.create(label)
        .then(({ name, url }) => {
          logInfo(`${name}: ${url}`)

          return commit(ASSIGN_DATA, {
            labels: reject(['name', name])(state.data.labels)
          })
        })
    ))(state.data.labels)
  )
}

export { CREATE_LABELS }
export default createLabels
