import assign from 'lodash/fp/assign'
import { logSuccess } from '../log'
import { PATCH_DATA, SET_TASK_INDEX } from '../mutations'

const RUN_TASK = 'RUN_TASK'

const runTask = ({ commit, dispatch }) => async ({
  action,
  index,
  payload
}) => {
  commit(SET_TASK_INDEX)(index)

  const value = await dispatch(action)(assign(payload)({ isSkipped: false }))

  commit(PATCH_DATA)({
    path: index,
    value: value
  })

  logSuccess('Done.\n')

  return value
}

export { RUN_TASK }
export default runTask
