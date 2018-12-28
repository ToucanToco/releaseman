import fs from 'fs'
import isEqual from 'lodash/fp/isEqual'
import { ACTIONS, STATE_FILE_PATH } from '../store'
import { RUN } from '../actions'
import { SET_CONFIG, SET_DATA, SET_TASK_INDEX } from '../mutations'

const RUN_CONTINUE = 'RUN_CONTINUE'

const runContinue = ({ commit, dispatch }) => {
  if (!fs.existsSync(STATE_FILE_PATH)) {
    return Promise.reject('There\'s no state file from which to continue!')
  }

  const state = JSON.parse(fs.readFileSync(STATE_FILE_PATH, 'utf8'))

  if (isEqual(state.config.action)(ACTIONS.CONTINUE)) {
    return Promise.reject(
      'There\'s no point in running continue from continue!'
    )
  }

  fs.unlinkSync(STATE_FILE_PATH)
  commit(SET_CONFIG, state.config)
  commit(SET_DATA, state.data)
  commit(SET_TASK_INDEX, state.taskIndex)

  return dispatch(RUN)
}

export { RUN_CONTINUE }
export default runContinue
