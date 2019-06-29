import Config from '../config'
import fs from 'fs'
import { COMMANDS, STATE_FILE_PATH } from '../store'
import { RUN_COMMAND, SAVE_STATE } from '../actions'
import { SET_CONFIG } from '../mutations'

const START = 'START'

const start = ({ commit, dispatch, state }) => async (argv) => {
  commit(SET_CONFIG)(Config(argv))

  if (
    state.config.command !== COMMANDS.CONTINUE &&
    fs.existsSync(STATE_FILE_PATH)
  ) {
    fs.unlinkSync(STATE_FILE_PATH)
  }
  try {
    await dispatch(RUN_COMMAND)()
  } catch (e) {
    await dispatch(SAVE_STATE)()

    throw e
  }

  return undefined
}

export { START }
export default start
