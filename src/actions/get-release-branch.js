import get from 'lodash/fp/get'
import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const GET_RELEASE_BRANCH = 'GET_RELEASE_BRANCH'

const getReleaseBranch = ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Get release branch')

  if (isSkipped) {
    return undefined
  }

  logInfo('Retrieving latest prerelease tag...')

  return getters.github.releases.getLatest({
    isPrerelease: true
  })
    .then(({ tag }) => {
      logInfo(tag)
      logInfo('Parsing release branch...')

      const tagMatch = new RegExp(
        `^${state.config.tag}(\\d+\\.\\d+\\.\\d+)-beta\\.?\\d*$`
      ).exec(tag)

      const branch = `${state.config.branches.release}${get(1)(tagMatch)}`

      logInfo(branch)

      return commit(ASSIGN_DATA, {
        branch: branch
      })
    })
}

export { GET_RELEASE_BRANCH }
export default getReleaseBranch
