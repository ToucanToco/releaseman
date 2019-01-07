import get from 'lodash/fp/get'
import { logInfo, logTaskStart } from '../log'

const GET_RELEASE_BRANCH = 'GET_RELEASE_BRANCH'

const getReleaseBranch = ({ getters, state }) => async ({ isSkipped }) => {
  logTaskStart('Get release branch')

  if (isSkipped) {
    return undefined
  }

  logInfo('Retrieving latest prerelease tag...')

  const { tag } = await getters.query('releases.getLatest')({
    isPrerelease: true
  })

  logInfo(tag)
  logInfo('Parsing release branch...')

  const tagMatch = new RegExp(
    `^${state.config.tag}(\\d+\\.\\d+\\.\\d+)-beta\\.?\\d*$`
  ).exec(tag)

  const name = `${state.config.branches.release}${get(1)(tagMatch)}`

  logInfo(name)

  return { name: name }
}

export { GET_RELEASE_BRANCH }
export default getReleaseBranch
