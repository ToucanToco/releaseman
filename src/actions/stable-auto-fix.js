import {
  CREATE_RELEASE,
  FIND_PULL_REQUEST,
  GET_CHANGELOG,
  GET_LATEST_RELEASE,
  GET_TAG,
  MERGE_BRANCHES,
  UPDATE_PULL_REQUEST
} from '../actions'

const STABLE_AUTO_FIX = 'STABLE_AUTO_FIX'

const stableAutoFix = ({ getters, state }) => async ({ index }) => {
  getters.validateConfig(
    'branches.alpha',
    'branches.beta',
    'branches.develop',
    'branches.master',
    'categories',
    'tag'
  )

  const tag = await getters.runOrSkip(index + 1)(GET_TAG)({ isFix: true })

  if (state.config.isRelease) {
    const latestRelease = await getters.runOrSkip(index + 2)(GET_LATEST_RELEASE)({
      isStable: true
    })
    const releaseChangelog = await getters.runOrSkip(index + 3)(GET_CHANGELOG)({
      base: latestRelease.tag,
      head: state.config.branches.master
    })
    const releaseNameMatch = new RegExp('^(.*?)(?: (\\d+))?$')
      .exec(latestRelease.name)
    const releaseName = releaseNameMatch[1]
    const hotfixNumber = (
      releaseNameMatch[2] === undefined
        ? 0
        : Number(releaseNameMatch[2])
    )
    await getters.runOrSkip(index + 4)(CREATE_RELEASE)({
      branch: state.config.branches.master,
      message: releaseChangelog.message,
      name: `${releaseName} ${hotfixNumber + 1}`,
      tag
    })
  }

  await getters.runOrSkip(index + 5)(MERGE_BRANCHES)({
    base: state.config.branches.beta,
    head: state.config.branches.master
  })
  const latestBeta = getters.runOrSkip(index + 6)(GET_LATEST_RELEASE)({
    isPrerelease: true
  })
  const latestBetaTagMatch = new RegExp(
    `^${state.config.tag}(\\d+)\\.(\\d+)\\.(\\d+)-beta(?:\\.(\\d+))?$`
  )
    .exec(latestBeta.tag)

  if (latestBetaTagMatch !== null) {
    const tagMatch = new RegExp(
      `^${state.config.tag}(\\d+)\\.(\\d+)\\.(\\d+)$`
    )
      .exec(tag)

    const latestBetaMajorVersion = Number(latestBetaTagMatch[1])
    const latestBetaMinorVersion = Number(latestBetaTagMatch[2])
    const majorVersion = Number(tagMatch[1])
    const minorVersion = Number(tagMatch[2])

    if (
      latestBetaMajorVersion > majorVersion ||
      latestBetaMinorVersion > minorVersion
    ) {
      if (state.config.isRelease) {
        const betaChangelog = await getters.runOrSkip(index + 7)(GET_CHANGELOG)({
          base: latestBeta.tag,
          head: state.config.branches.beta
        })
        const betaTag = await getters.runOrSkip(index + 8)(GET_TAG)({
          isBeta: true,
          isFix: true
        })
        const betaNameMatch = new RegExp('^(.*?) beta(?: (\\d+))?$')
          .exec(latestBeta.name)
        const betaName = betaNameMatch[1]
        const fixNumber = (
          betaNameMatch[2] === undefined
            ? 0
            : Number(betaNameMatch[2])
        )
        await getters.runOrSkip(index + 9)(CREATE_RELEASE)({
          branch: state.config.branches.beta,
          isPrerelease: true,
          message: betaChangelog.message,
          name: `${betaName} ${fixNumber + 1}`,
          tag: betaTag
        })
      }

      const betaPull = await getters.runOrSkip(index + 10)(FIND_PULL_REQUEST)({
        base: state.config.branches.master,
        head: state.config.branches.beta
      })

      if (betaPull !== undefined) {
        const betaChangelog = await getters.runOrSkip(index + 11)(GET_CHANGELOG)({
          base: state.config.branches.master,
          head: state.config.branches.beta
        })
        await getters.runOrSkip(index + 12)(UPDATE_PULL_REQUEST)({
          message: betaChangelog.message,
          number: betaPull.number
        })
      }
    }
  }

  await getters.runOrSkip(index + 13)(MERGE_BRANCHES)({
    base: state.config.branches.alpha,
    head: state.config.branches.beta
  })
  const alphaPull = await getters.runOrSkip(index + 14)(FIND_PULL_REQUEST)({
    base: state.config.branches.beta,
    head: state.config.branches.alpha
  })

  if (alphaPull !== undefined) {
    const alphaChangelog = await getters.runOrSkip(index + 15)(GET_CHANGELOG)({
      base: state.config.branches.beta,
      head: state.config.branches.alpha
    })
    await getters.runOrSkip(index + 16)(UPDATE_PULL_REQUEST)({
      message: alphaChangelog.message,
      number: alphaPull.number
    })
  }
  await getters.runOrSkip(index + 17)(MERGE_BRANCHES)({
    base: state.config.branches.develop,
    head: state.config.branches.alpha
  })

  return index + 17
}

export { STABLE_AUTO_FIX }
export default stableAutoFix
