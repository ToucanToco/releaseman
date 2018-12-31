import lt from 'lodash/fp/lt'
import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const GET_RELEASES_EXISTENCE = 'GET_RELEASES_EXISTENCE'

const getReleasesExistence = async ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Get releases existence')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Retrieving ${
    state.data.isPrerelease
      ? 'prereleases'
      : 'releases'
  } existence...`)

  const size = await getters.query('releases.size')({
    isPrerelease: state.data.isPrerelease
  })

  const isWithReleases = lt(0)(size)

  logInfo(isWithReleases)

  return commit(ASSIGN_DATA, { isWithReleases: isWithReleases })
}

export { GET_RELEASES_EXISTENCE }
export default getReleasesExistence
