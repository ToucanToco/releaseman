import {
  CREATE_RELEASE,
  GET_CHANGELOG,
  GET_LATEST_TAG,
  GET_TAG
} from '../actions'

const STABLE_AUTO_RELEASE = 'STABLE_AUTO_RELEASE'

const stableAutoRelease = ({ getters, state }) => async ({ index, name }) => {
  getters.validateConfig(
    'branches.master',
    'categories',
    'labels.breaking',
    'tag'
  )

  const latestTag = await getters.runOrSkip(index + 1)(GET_LATEST_TAG)({
    isStable: true
  })
  const releaseChangelog = await getters.runOrSkip(index + 2)(GET_CHANGELOG)({
    base: latestTag,
    head: state.config.branches.master
  })
  const tag = await getters.runOrSkip(index + 3)(GET_TAG)({
    isBreaking: releaseChangelog.labels.includes(state.config.labels.breaking)
  })
  await getters.runOrSkip(index + 4)(CREATE_RELEASE)({
    branch: state.config.branches.master,
    message: releaseChangelog.message,
    name: name,
    tag
  })

  return index + 4
}

export { STABLE_AUTO_RELEASE }
export default stableAutoRelease
