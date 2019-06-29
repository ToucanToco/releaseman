import { logWarn } from '../log'

const SKIP_TASK = 'SKIP_TASK'

const skipTask = ({ state }) => async ({ index }) => {
  logWarn('Skipped.\n')

  return state.data[index]
}

export { SKIP_TASK }
export default skipTask
