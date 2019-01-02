import { logInfo, logTaskStart } from '../log'

const DELETE_BRANCH = 'DELETE_BRANCH'

const deleteBranch = ({ getters }) => async ({ branch, isSkipped }) => {
  logTaskStart('Delete branch')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Deleting branch \`${branch}\`...`)

  await getters.query('branches.delete')({ branch: branch })

  return undefined
}

export { DELETE_BRANCH }
export default deleteBranch
