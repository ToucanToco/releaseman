import { logInfo, logTaskStart } from '../log'

const UPDATE_BRANCH = 'UPDATE_BRANCH'

const updateBranch = ({ getters }) => async ({ base, head, isSkipped }) => {
  logTaskStart('Update branch')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Updating \`${base}\` to \`${head}\`...`)

  const { url } = await getters.query('branches.update')({
    base: base,
    head: head
  })

  return logInfo(url)
}

export { UPDATE_BRANCH }
export default updateBranch
