import { logInfo, logTaskStart } from '../log'

const MERGE_BRANCHES = 'MERGE_BRANCHES'

const mergeBranches = async ({ getters, state }, isSkipped) => {
  logTaskStart('Merge branches')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Merging \`${state.data.head}\` into \`${state.data.base}\`...`)

  const { url } = await getters.github.branches.merge({
    base: state.data.base,
    head: state.data.head
  })

  return logInfo(url)
}

export { MERGE_BRANCHES }
export default mergeBranches
