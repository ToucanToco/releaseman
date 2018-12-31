import { logSuccess } from '../log'
import { SET_TASK_INDEX } from '../mutations'

const RUN_TASK = 'RUN_TASK'

const runTask = async ({ commit, dispatch }, { index, name }) => {
  commit(SET_TASK_INDEX, index)

  await dispatch(name)

  return logSuccess('Done.\n')
}

export { RUN_TASK }
export default runTask
