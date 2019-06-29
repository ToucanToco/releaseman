import { logInfo } from '../log'

const GET_LATEST_RELEASE = 'GET_LATEST_RELEASE'

const getLatestRelease = ({ getters }) => async ({
  isPrerelease = false,
  isStable = false
}) => {
  logInfo(`Retrieving latest ${
    isPrerelease
      ? 'prerelease'
      : 'release'
  }...`)

  const latestRelease = await getters.query('releases.getLatest')({
    isPrerelease,
    isStable
  })

  logInfo(`${latestRelease.tag}: ${latestRelease.name}`)
  logInfo(latestRelease.url)

  return latestRelease
}

export { GET_LATEST_RELEASE }
export default getLatestRelease
