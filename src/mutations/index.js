import patchData, { PATCH_DATA } from './patch-data'
import setConfig, { SET_CONFIG } from './set-config'
import setData, { SET_DATA } from './set-data'
import setTaskIndex, { SET_TASK_INDEX } from './set-task-index'

const mutations = {
  [PATCH_DATA]: patchData,
  [SET_CONFIG]: setConfig,
  [SET_DATA]: setData,
  [SET_TASK_INDEX]: setTaskIndex
}

export {
  PATCH_DATA,
  SET_CONFIG,
  SET_DATA,
  SET_TASK_INDEX
}
export default mutations
