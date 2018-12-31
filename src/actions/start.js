import Config from '../config'
import fs from 'fs'
import isEqual from 'lodash/fp/isEqual'
import { ACTIONS, STATE_FILE_PATH } from '../store'
import { RUN, SAVE_STATE } from '../actions'
import { SET_CONFIG } from '../mutations'

const START = 'START'

const start = async ({ commit, dispatch, state }, argv) => {
  commit(SET_CONFIG, Config(argv))

  if (
    !isEqual(state.config.action)(ACTIONS.CONTINUE) &&
    fs.existsSync(STATE_FILE_PATH)
  ) {
    fs.unlinkSync(STATE_FILE_PATH)
  }

  try {
    await dispatch(RUN)
  } catch (e) {
    await dispatch(SAVE_STATE)

    throw e
  }

  return undefined
}

export { START }
export default start
