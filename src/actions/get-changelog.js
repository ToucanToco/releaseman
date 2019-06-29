import { logInfo } from '../log'

const GET_CHANGELOG = 'GET_CHANGELOG'

const getChangelog = ({ getters }) => async ({ base, head }) => {
  logInfo(`Retrieving changelog for \`${head}\` since \`${base}\`...`)

  const changelog = await getters.query('commits.getChangelog')({
    base: base,
    head: head
  })

  logInfo(changelog.message)

  return changelog
}

export { GET_CHANGELOG }
export default getChangelog
