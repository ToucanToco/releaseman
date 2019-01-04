import concat from 'lodash/fp/concat'
import flow from 'lodash/fp/flow'
import includes from 'lodash/fp/includes'
import isEqual from 'lodash/fp/isEqual'
import map from 'lodash/fp/map'
import startsWith from 'lodash/fp/startsWith'
import {
  CREATE_RELEASE,
  DELETE_BRANCH,
  FIND_PULL_REQUEST,
  GET_CHANGELOG,
  GET_LATEST_RELEASE,
  GET_NEXT_RELEASE,
  GET_PULL_REQUEST,
  GET_PULL_REQUEST_LABELS,
  GET_RELEASE_BRANCH,
  MERGE_BRANCHES,
  MERGE_PULL_REQUEST,
  UPDATE_BRANCH,
  UPDATE_PULL_REQUEST,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions'
import { logActionEnd, logActionStart, logWarn } from '../log'

const RUN_FIX_FINISH = 'RUN_FIX_FINISH'

const runFixFinish = ({ getters, state }) => async () => {
  logActionStart(RUN_FIX_FINISH)
  getters.validateConfig(
    'branches.beta',
    'branches.develop',
    (
      state.config.isDoc
        ? 'branches.doc'
        : 'branches.fix'
    ),
    'branches.release',
    'categories',
    (
      state.config.isDoc
        ? 'labels.doc'
        : 'labels.fix'
    ),
    'labels.release',
    'number',
    'tag'
  )

  const releaseBranch = await getters.runOrSkip(0)(GET_RELEASE_BRANCH)()
  const pullRequest = await getters.runOrSkip(1)(GET_PULL_REQUEST)({
    number: state.config.number
  })

  if (!isEqual(releaseBranch.name)(pullRequest.base)) {
    throw `A fix cannot be merged into \`${pullRequest.base}\`!`
  }

  const fixBranchesPrefix = (
    state.config.isDoc
      ? state.config.branches.doc
      : state.config.branches.fix
  )

  if (!startsWith(fixBranchesPrefix)(pullRequest.head)) {
    throw `A fix branch name must start with \`${
      fixBranchesPrefix
    }\`, your branch name is \`${pullRequest.head}\`!`
  }

  const pullRequestLabels = (
    await getters.runOrSkip(2)(GET_PULL_REQUEST_LABELS)({
      number: state.config.number
    })
  )

  const fixLabel = (
    state.config.isDoc
      ? state.config.labels.doc
      : state.config.labels.fix
  )

  if (!flow(
    map('name'),
    includes(fixLabel)
  )(pullRequestLabels)) {
    logWarn(`Missing ${fixLabel} label.\n`)

    await getters.runOrSkip(3)(UPDATE_PULL_REQUEST_LABELS)({
      labels: flow(
        map('name'),
        concat(fixLabel)
      )(pullRequestLabels),
      number: state.config.number
    })
  }

  await getters.runOrSkip(4)(MERGE_PULL_REQUEST)({
    isMergeable: pullRequest.isMergeable,
    isMerged: pullRequest.isMerged,
    message: `${pullRequest.name} (#${state.config.number})`,
    method: 'squash',
    number: state.config.number
  })
  await getters.runOrSkip(5)(DELETE_BRANCH)({
    name: pullRequest.head
  })

  if (state.config.isRelease) {
    const latestPrerelease = await getters.runOrSkip(6)(GET_LATEST_RELEASE)({
      isPrerelease: true
    })
    const fixChangelog = await getters.runOrSkip(7)(GET_CHANGELOG)({
      base: latestPrerelease.tag,
      head: releaseBranch.name
    })
    const nextPrerelease = await getters.runOrSkip(8)(GET_NEXT_RELEASE)({
      isBreaking: false,
      isFix: true,
      isPrerelease: true
    })
    await getters.runOrSkip(9)(CREATE_RELEASE)({
      branch: releaseBranch.name,
      changelog: fixChangelog.text,
      isPrerelease: true,
      name: nextPrerelease.name,
      tag: nextPrerelease.tag
    })
    const releaseChangelog = await getters.runOrSkip(10)(GET_CHANGELOG)({
      base: state.config.branches.master,
      head: releaseBranch.name
    })
    const releasePullRequest = await getters.runOrSkip(11)(FIND_PULL_REQUEST)({
      base: state.config.branches.master,
      head: releaseBranch.name
    })
    await getters.runOrSkip(12)(UPDATE_PULL_REQUEST)({
      changelog: releaseChangelog.text,
      name: releasePullRequest.name,
      number: releasePullRequest.number
    })
  }

  await getters.runOrSkip(13)(MERGE_BRANCHES)({
    base: state.config.branches.develop,
    head: releaseBranch.name
  })
  await getters.runOrSkip(14)(UPDATE_BRANCH)({
    base: state.config.branches.beta,
    head: releaseBranch.name
  })

  return logActionEnd(RUN_FIX_FINISH)
}

export { RUN_FIX_FINISH }
export default runFixFinish
