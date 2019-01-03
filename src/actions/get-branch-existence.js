import { logInfo, logTaskStart } from '../log'

const GET_BRANCH_EXISTENCE = 'GET_BRANCH_EXISTENCE'

const getBranchExistence = ({ getters }) => async ({ isSkipped, name }) => {
  logTaskStart('Get branch existence')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Retrieving ${name} existence...`)

  const isBranchPresent = await getters.query('branches.getExistence')({
    name: name
  })

  logInfo(isBranchPresent)

  return isBranchPresent
}

export { GET_BRANCH_EXISTENCE }
export default getBranchExistence
