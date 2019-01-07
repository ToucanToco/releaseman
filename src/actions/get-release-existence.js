import lt from 'lodash/fp/lt'
import { logInfo, logTaskStart } from '../log'

const GET_RELEASE_EXISTENCE = 'GET_RELEASE_EXISTENCE'

const getReleaseExistence = ({ getters }) => async ({
  isPrerelease,
  isSkipped
}) => {
  logTaskStart('Get release existence')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Retrieving ${
    isPrerelease
      ? 'prerelease'
      : 'release'
  } existence...`)

  const size = await getters.query('releases.size')({
    isPrerelease: isPrerelease
  })

  const isReleasePresent = lt(0)(size)

  logInfo(isReleasePresent)

  return isReleasePresent
}

export { GET_RELEASE_EXISTENCE }
export default getReleaseExistence
