import {
  CREATE_RELEASE,
  FIND_PULL_REQUEST,
  GET_CHANGELOG,
  GET_LATEST_RELEASE,
  GET_TAG,
  MERGE_BRANCHES,
  UPDATE_PULL_REQUEST
} from '../actions'

const BETA_AUTO_FIX = 'BETA_AUTO_FIX'

const betaAutoFix = ({ getters, state }) => async ({ index }) => {
  getters.validateConfig(
    'branches.alpha',
    'branches.beta',
    'branches.develop',
    'branches.master',
    'categories'
  )

  if (state.config.isRelease) {
    getters.validateConfig('tag')

    const tag = await getters.runOrSkip(index + 1)(GET_TAG)({
      isBeta: true,
      isFix: true
    })
    const latestRelease = await getters.runOrSkip(index + 2)(GET_LATEST_RELEASE)({
      isPrerelease: true
    })
    const releaseChangelog = await getters.runOrSkip(index + 3)(GET_CHANGELOG)({
      base: latestRelease.tag,
      head: state.config.branches.beta
    })
    const releaseNameMatch = new RegExp('^(.*?) beta(?: (\\d+))?$')
      .exec(latestRelease.name)
    const releaseName = releaseNameMatch[1]
    const betaNumber = (
      releaseNameMatch[2] === undefined
        ? 0
        : Number(releaseNameMatch[2])
    )
    await getters.runOrSkip(index + 4)(CREATE_RELEASE)({
      branch: state.config.branches.beta,
      isPrerelease: true,
      message: releaseChangelog.message,
      name: `${releaseName} beta ${betaNumber + 1}`,
      tag
    })
  }

  const pull = await getters.runOrSkip(index + 5)(FIND_PULL_REQUEST)({
    base: state.config.branches.master,
    head: state.config.branches.beta
  })

  if (pull !== undefined) {
    const changelog = await getters.runOrSkip(index + 6)(GET_CHANGELOG)({
      base: state.config.branches.master,
      head: state.config.branches.beta
    })
    await getters.runOrSkip(index + 7)(UPDATE_PULL_REQUEST)({
      message: changelog.message,
      number: pull.number
    })
  }

  await getters.runOrSkip(index + 8)(MERGE_BRANCHES)({
    base: state.config.branches.alpha,
    head: state.config.branches.beta
  })
  const alphaPull = await getters.runOrSkip(index + 9)(FIND_PULL_REQUEST)({
    base: state.config.branches.beta,
    head: state.config.branches.alpha
  })

  if (alphaPull !== undefined) {
    const alphaChangelog = await getters.runOrSkip(index + 10)(GET_CHANGELOG)({
      base: state.config.branches.beta,
      head: state.config.branches.alpha
    })
    await getters.runOrSkip(index + 11)(UPDATE_PULL_REQUEST)({
      message: alphaChangelog.message,
      number: alphaPull.number
    })
  }

  await getters.runOrSkip(index + 12)(MERGE_BRANCHES)({
    base: state.config.branches.develop,
    head: state.config.branches.alpha
  })

  return index + 12
}

export { BETA_AUTO_FIX }
export default betaAutoFix
