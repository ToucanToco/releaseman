import { logInfo, logWarn } from '../log'

const MERGE_BRANCHES = 'MERGE_BRANCHES'

const mergeBranches = ({ getters }) => async ({ base, head }) => {
  logInfo(`Merging \`${head}\` into \`${base}\`...`)

  const { commits } = await getters.query('commits.compare')({
    base: base,
    head: head
  })

  if (commits.length === 0) {
    return logWarn('Branches already merged.')
  }

  const { url } = await getters.query('branches.merge')({
    base: base,
    head: head
  })

  return logInfo(url)
}

export { MERGE_BRANCHES }
export default mergeBranches
