import { logInfo } from '../log'

const GET_LATEST_TAG = 'GET_LATEST_TAG'

const getLatestTag = ({ getters }) => async ({
  isPrerelease = false,
  isStable = false
}) => {
  logInfo(`Retrieving latest ${
    isPrerelease
      ? 'prerelease'
      : 'release'
  } tag...`)

  const latestRelease = await getters.query('releases.getLatest')({
    isPrerelease,
    isStable
  })

  logInfo(latestRelease.tag)
  logInfo(latestRelease.url)

  return latestRelease.tag
}

export { GET_LATEST_TAG }
export default getLatestTag
