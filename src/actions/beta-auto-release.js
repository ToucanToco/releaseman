import {
  CREATE_PULL_REQUEST,
  CREATE_RELEASE,
  GET_CHANGELOG,
  GET_LATEST_TAG,
  GET_TAG,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions'

const BETA_AUTO_RELEASE = 'BETA_AUTO_RELEASE'

const betaAutoRelease = ({ getters, state }) => async ({ index, name }) => {
  getters.validateConfig(
    'branches.beta',
    'branches.master',
    'categories',
    'labels.breaking',
    'labels.release',
    'tag'
  )

  const latestTag = await getters.runOrSkip(index + 1)(GET_LATEST_TAG)()
  const releaseChangelog = await getters.runOrSkip(index + 2)(GET_CHANGELOG)({
    base: latestTag,
    head: state.config.branches.beta
  })
  const tag = await getters.runOrSkip(index + 3)(GET_TAG)({
    isBeta: true,
    isBreaking: releaseChangelog.labels.includes(state.config.labels.breaking)
  })
  await getters.runOrSkip(index + 4)(CREATE_RELEASE)({
    branch: state.config.branches.beta,
    isPrerelease: true,
    message: releaseChangelog.message,
    name: `${name} beta`,
    tag
  })
  const changelog = await getters.runOrSkip(index + 5)(GET_CHANGELOG)({
    base: state.config.branches.master,
    head: state.config.branches.beta
  })
  const pull = await getters.runOrSkip(index + 6)(CREATE_PULL_REQUEST)({
    base: state.config.branches.master,
    head: state.config.branches.beta,
    message: changelog.message,
    name: `Release :: ${name}`
  })
  await getters.runOrSkip(index + 7)(UPDATE_PULL_REQUEST_LABELS)({
    labels: changelog.labels.includes(state.config.labels.breaking)
      ? [state.config.labels.breaking, state.config.labels.release]
      : [state.config.labels.release],
    number: pull.number
  })

  return index + 7
}

export { BETA_AUTO_RELEASE }
export default betaAutoRelease
