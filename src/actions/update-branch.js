import { logInfo, logTaskStart } from '../log'

const UPDATE_BRANCH = 'UPDATE_BRANCH'

const updateBranch = ({ getters, state }, isSkipped) => {
  logTaskStart('Update branch')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Updating \`${state.data.base}\` to \`${state.data.head}\`...`)

  return getters.github.branches.update({
    base: state.data.base,
    head: state.data.head
  })
    .then(({ url }) => logInfo(url))
}

export { UPDATE_BRANCH }
export default updateBranch
