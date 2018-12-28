import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const GET_CHANGELOG = 'GET_CHANGELOG'

const getChangelog = ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Get changelog')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Retrieving changelog for \`${
    state.data.head
  }\` since \`${
    state.data.base
  }\`...`)

  return getters.github.commits.getChangelog({
    base: state.data.base,
    head: state.data.head
  })
    .then((changelog) => {
      logInfo(changelog.text)

      return commit(ASSIGN_DATA, { changelog: changelog })
    })
}

export { GET_CHANGELOG }
export default getChangelog
