import { logWarn } from '../log'

const SKIP_TASK = 'SKIP_TASK'

const skipTask = async ({ dispatch }, { name }) => {
  await dispatch(name, true)

  return logWarn('Skipped.\n')
}

export { SKIP_TASK }
export default skipTask
