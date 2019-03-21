import get from 'lodash/fp/get'
import includes from 'lodash/fp/includes'
import isNull from 'lodash/fp/isNull'
import isUndefined from 'lodash/fp/isUndefined'
import {
  CREATE_BRANCH,
  CREATE_PULL_REQUEST,
  CREATE_RELEASE,
  GET_CHANGELOG,
  GET_LATEST_RELEASE,
  GET_NEXT_RELEASE,
  UPDATE_BRANCH,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_RELEASE_START = 'RUN_RELEASE_START'

const runReleaseStart = ({ getters, state }) => async () => {
  logActionStart(RUN_RELEASE_START)
  getters.validateConfig(
    'branches.beta',
    'branches.develop',
    'branches.master',
    'branches.release',
    'categories',
    'labels.breaking',
    'labels.release',
    'name',
    'tag'
  )

  if (/\sbeta$/i.test(state.config.name)) {
    throw 'The <name> param must be the final release name (no beta)!'
  }

  const latestRelease = await getters.runOrSkip(0)(GET_LATEST_RELEASE)()
  const releaseChangelog = await getters.runOrSkip(1)(GET_CHANGELOG)({
    base: latestRelease.tag,
    head: state.config.branches.develop
  })
  const nextPrerelease = await getters.runOrSkip(2)(GET_NEXT_RELEASE)({
    isBreaking: includes(state.config.labels.breaking)(releaseChangelog.labels),
    isFix: false,
    isPrerelease: true
  })

  const version = get(1)(
    new RegExp(`^${state.config.tag}(\\d+\\.\\d+\\.\\d+)-beta$`)
      .exec(nextPrerelease.tag)
  )

  const branch = `${state.config.branches.release}${version}`

  await getters.runOrSkip(3)(CREATE_BRANCH)({
    base: state.config.branches.develop,
    head: branch
  })
  await getters.runOrSkip(4)(CREATE_RELEASE)({
    branch: branch,
    changelog: releaseChangelog.text,
    isPrerelease: true,
    name: nextPrerelease.name,
    tag: nextPrerelease.tag
  })
  const fullChangelog = await getters.runOrSkip(5)(GET_CHANGELOG)({
    base: state.config.branches.master,
    head: branch
  })
  const pullRequest = await getters.runOrSkip(6)(CREATE_PULL_REQUEST)({
    base: state.config.branches.master,
    changelog: fullChangelog.text,
    head: branch,
    name: `Release :: ${get(1)(
      new RegExp('^(.*?) beta$').exec(nextPrerelease.name)
    )}`
  })
  await getters.runOrSkip(7)(UPDATE_PULL_REQUEST_LABELS)({
    labels: [state.config.labels.release],
    number: pullRequest.number
  })
  await getters.runOrSkip(8)(UPDATE_BRANCH)({
    base: state.config.branches.beta,
    head: branch
  })

  const prevVersion = get(1)(
    new RegExp(`^${state.config.tag}(\\d+\\.\\d+\\.\\d+)-beta\\.?\\d*$`)
      .exec(latestRelease.tag)
  )

  if (!isNull(prevVersion)) {
    const prevReleaseBranch = (
      `${state.config.branches.release}${prevVersion}`
    )

    const prevReleasePullRequest = await getters.runOrSkip(9)(
      FIND_PULL_REQUEST
    )({
      base: state.config.branches.master,
      head: prevReleaseBranch
    })

    if (!isUndefined(prevReleasePullRequest)) {
      await getters.runOrSkip(10)(CLOSE_PULL_REQUEST)({
        number: prevReleasePullRequest.number
      })
      await getters.runOrSkip(11)(DELETE_BRANCH)({
        name: prevReleaseBranch
      })
    }
  }

  return logActionEnd(RUN_RELEASE_START)
}

export { RUN_RELEASE_START }
export default runReleaseStart
