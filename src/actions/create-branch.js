import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const CREATE_BRANCH = 'CREATE_BRANCH'

const createBranch = async ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Create branch')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Creating branch \`${
    state.data.head
  }\` from \`${
    state.data.base
  }\`...`)

  const { branch, url } = await getters.github.branches.create({
    base: state.data.base,
    head: state.data.head
  })

  logInfo(url)

  return commit(ASSIGN_DATA, { branch: branch })
}

export { CREATE_BRANCH }
export default createBranch
