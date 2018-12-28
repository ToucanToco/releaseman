import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const GET_LATEST_RELEASE_TAG = 'GET_LATEST_RELEASE_TAG'

const getLatestReleaseTag = ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Get latest release tag')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Retrieving latest ${
    state.data.isPrerelease
      ? 'prerelease'
      : 'release'
  } tag...`)

  return getters.github.releases.getLatest({
    isPrerelease: state.data.isPrerelease
  })
    .then(({ tag }) => {
      logInfo(tag)

      return commit(ASSIGN_DATA, { tag: tag })
    })
}

export { GET_LATEST_RELEASE_TAG }
export default getLatestReleaseTag
