import { logInfo, logWarn } from '../log'

const DELETE_BRANCH = 'DELETE_BRANCH'

const deleteBranch = ({ getters }) => async ({ name }) => {
  logInfo(`Deleting \`${name}\`...`)

  const isExisting = await getters.query('branches.getExistence')({ name })

  if (!isExisting) {
    return logWarn('Branch does not exist.')
  }

  await getters.query('branches.delete')({ name })

  return undefined
}

export { DELETE_BRANCH }
export default deleteBranch
