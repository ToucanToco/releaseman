import { logInfo, logTaskStart } from '../log'

const GET_LATEST_RELEASE = 'GET_LATEST_RELEASE'

const getLatestRelease = ({ getters }) => async ({
  isPrerelease,
  isSkipped,
  isStable
}) => {
  logTaskStart('Get latest release')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Retrieving latest ${
    isPrerelease
      ? 'prerelease'
      : 'release'
  }...`)

  const latestRelease = await getters.query('releases.getLatest')({
    isPrerelease: isPrerelease,
    isStable: isStable
  })

  logInfo(`${latestRelease.tag}: ${latestRelease.name}`)

  return latestRelease
}

export { GET_LATEST_RELEASE }
export default getLatestRelease
