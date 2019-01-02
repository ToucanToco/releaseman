import lt from 'lodash/fp/lt'
import { logInfo, logTaskStart } from '../log'

const GET_RELEASES_EXISTENCE = 'GET_RELEASES_EXISTENCE'

const getReleasesExistence = ({ getters }) => async ({
  isPrerelease,
  isSkipped
}) => {
  logTaskStart('Get releases existence')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Retrieving ${
    isPrerelease
      ? 'prereleases'
      : 'releases'
  } existence...`)

  const size = await getters.query('releases.size')({
    isPrerelease: isPrerelease
  })

  const isReleasesPresent = lt(0)(size)

  logInfo(isReleasesPresent)

  return isReleasesPresent
}

export { GET_RELEASES_EXISTENCE }
export default getReleasesExistence
