import { GET_CHANGELOG } from '../actions'
import { logCommandEnd, logCommandStart } from '../log'

const COMPARE = 'COMPARE'

const compare = ({ getters, state }) => async () => {
  logCommandStart(COMPARE)
  getters.validateConfig(
    'base',
    'head'
  )

  await getters.runOrSkip(0)(GET_CHANGELOG)({
    base: state.config.base,
    head: state.config.head
  })

  return logCommandEnd(COMPARE)
}

export { COMPARE }
export default compare
