import { logInfo, logTaskStart } from '../log'

const CREATE_BRANCH = 'CREATE_BRANCH'

const createBranch = ({ getters }) => async ({ base, head, isSkipped }) => {
  logTaskStart('Create branch')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Creating branch \`${head}\` from \`${base}\`...`)

  const branch = await getters.query('branches.create')({
    base: base,
    head: head
  })

  logInfo(branch.url)

  return branch
}

export { CREATE_BRANCH }
export default createBranch
