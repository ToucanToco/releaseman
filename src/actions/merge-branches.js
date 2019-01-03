import { logInfo, logTaskStart } from '../log'

const MERGE_BRANCHES = 'MERGE_BRANCHES'

const mergeBranches = ({ getters }) => async ({ base, head, isSkipped }) => {
  logTaskStart('Merge branches')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Merging \`${head}\` into \`${base}\`...`)

  const { url } = await getters.query('branches.merge')({
    base: base,
    head: head
  })

  return logInfo(url)
}

export { MERGE_BRANCHES }
export default mergeBranches
