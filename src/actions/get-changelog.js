import { logInfo, logTaskStart } from '../log'

const GET_CHANGELOG = 'GET_CHANGELOG'

const getChangelog = ({ getters }) => async ({ base, head, isSkipped }) => {
  logTaskStart('Get changelog')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Retrieving changelog for \`${head}\` since \`${base}\`...`)

  const changelog = await getters.query('commits.getChangelog')({
    base: base,
    head: head
  })

  logInfo(changelog.text)

  return changelog
}

export { GET_CHANGELOG }
export default getChangelog
