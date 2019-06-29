import { logInfo } from '../log'

const GET_BRANCH = 'GET_BRANCH'

const getBranch = ({ getters }) => async ({ name }) => {
  logInfo(`Retrieving branch \`${name}\`...`)

  const branch = await getters.query('branches.get')({ name })

  logInfo(branch.message)
  logInfo(branch.url)

  return branch
}

export { GET_BRANCH }
export default getBranch
