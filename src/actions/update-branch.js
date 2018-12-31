import { logInfo, logTaskStart } from '../log'

const UPDATE_BRANCH = 'UPDATE_BRANCH'

const updateBranch = async ({ getters, state }, isSkipped) => {
  logTaskStart('Update branch')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Updating \`${state.data.base}\` to \`${state.data.head}\`...`)

  const { url } = await getters.github.branches.update({
    base: state.data.base,
    head: state.data.head
  })

  return logInfo(url)
}

export { UPDATE_BRANCH }
export default updateBranch
