import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const GET_LATEST_RELEASE = 'GET_LATEST_RELEASE'

const getLatestRelease = ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Get latest release')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Retrieving latest ${
    state.data.isPrerelease
      ? 'prerelease'
      : 'release'
  }...`)

  return getters.github.releases.getLatest({
    isPrerelease: state.data.isPrerelease
  })
    .then(({ name, tag }) => {
      logInfo(`${tag}: ${name}`)

      return commit(ASSIGN_DATA, {
        name: name,
        tag: tag
      })
    })
}

export { GET_LATEST_RELEASE }
export default getLatestRelease
