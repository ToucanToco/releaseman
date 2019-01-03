import { logInfo, logTaskStart } from '../log'

const DELETE_BRANCH = 'DELETE_BRANCH'

const deleteBranch = ({ getters }) => async ({ isSkipped, name }) => {
  logTaskStart('Delete branch')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Deleting branch \`${name}\`...`)

  await getters.query('branches.delete')({ name: name })

  return undefined
}

export { DELETE_BRANCH }
export default deleteBranch
