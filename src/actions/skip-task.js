import assign from 'lodash/fp/assign'
import get from 'lodash/fp/get'
import { logWarn } from '../log'

const SKIP_TASK = 'SKIP_TASK'

const skipTask = ({ dispatch, state }) => async ({
  action,
  index,
  payload
}) => {
  await dispatch(action)(assign(payload)({ isSkipped: true }))

  logWarn('Skipped.\n')

  return get(index)(state.data)
}

export { SKIP_TASK }
export default skipTask
