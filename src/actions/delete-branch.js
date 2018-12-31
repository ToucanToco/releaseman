import { logInfo, logTaskStart } from '../log'

const DELETE_BRANCH = 'DELETE_BRANCH'

const deleteBranch = async ({ getters, state }, isSkipped) => {
  logTaskStart('Delete branch')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Deleting branch \`${state.data.branch}\`...`)

  await getters.query('branches.delete')({ branch: state.data.branch })

  return undefined
}

export { DELETE_BRANCH }
export default deleteBranch
