import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const CREATE_RELEASE = 'CREATE_RELEASE'

const createRelease = ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Create release')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Creating new ${
    state.data.isPrerelease
      ? 'prerelease'
      : 'release'
  }...`)

  return getters.github.releases.create({
    branch: state.data.branch,
    changelog: state.data.changelog.text,
    isPrerelease: state.data.isPrerelease,
    name: state.data.name,
    tag: state.data.tag
  })
    .then(({ tag, url }) => {
      logInfo(url)

      return commit(ASSIGN_DATA, { tag: tag })
    })
}

export { CREATE_RELEASE }
export default createRelease
