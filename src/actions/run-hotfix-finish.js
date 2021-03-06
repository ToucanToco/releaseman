import concat from 'lodash/fp/concat'
import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import gt from 'lodash/fp/gt'
import includes from 'lodash/fp/includes'
import isEqual from 'lodash/fp/isEqual'
import map from 'lodash/fp/map'
import some from 'lodash/fp/some'
import startsWith from 'lodash/fp/startsWith'
import {
  CREATE_RELEASE,
  DELETE_BRANCH,
  GET_CHANGELOG,
  GET_LATEST_RELEASE,
  GET_NEXT_RELEASE,
  GET_PULL_REQUEST,
  GET_PULL_REQUEST_LABELS,
  GET_RELEASE_BRANCH,
  MERGE_BRANCHES,
  MERGE_PULL_REQUEST,
  UPDATE_BRANCH,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions'
import { logActionEnd, logActionStart, logWarn } from '../log'

const RUN_HOTFIX_FINISH = 'RUN_HOTFIX_FINISH'

const runHotfixFinish = ({ getters, state }) => async () => {
  logActionStart(RUN_HOTFIX_FINISH)
  getters.validateConfig(
    'branches.beta',
    'branches.develop',
    (
      state.config.isDoc
        ? 'branches.doc'
        : 'branches.hotfix'
    ),
    'branches.master',
    'branches.release',
    'categories',
    (
      state.config.isDoc
        ? 'labels.doc'
        : 'labels.fix'
    ),
    'labels.release',
    'labels.wip',
    'number',
    'tag'
  )

  const pullRequest = await getters.runOrSkip(0)(GET_PULL_REQUEST)({
    number: state.config.number
  })

  if (!isEqual(state.config.branches.master)(pullRequest.base)) {
    throw `A hotfix cannot be merged into \`${pullRequest.base}\`!`
  }

  const hotfixBranchesPrefix = (
    state.config.isDoc
      ? state.config.branches.doc
      : state.config.branches.hotfix
  )

  if (!startsWith(hotfixBranchesPrefix)(pullRequest.head)) {
    throw `A hotfix branch name must start with \`${
      hotfixBranchesPrefix
    }\`, your branch name is \`${pullRequest.head}\`!`
  }

  const pullRequestLabelsName = map('name')(
    await getters.runOrSkip(1)(GET_PULL_REQUEST_LABELS)({
      number: state.config.number
    })
  )

  if (includes(state.config.labels.wip)(pullRequestLabelsName)) {
    throw 'This hotfix is still a work in progress!'
  }
  if (!flow(
    map('label'),
    concat(state.config.labels.release),
    some((label) => includes(label)(pullRequestLabelsName))
  )(state.config.categories)) {
    const fixLabel = (
      state.config.isDoc
        ? state.config.labels.doc
        : state.config.labels.fix
    )

    logWarn(`Missing label, defaulting to ${fixLabel}.\n`)

    await getters.runOrSkip(2)(UPDATE_PULL_REQUEST_LABELS)({
      labels: concat(fixLabel)(pullRequestLabelsName),
      number: state.config.number
    })
  }

  await getters.runOrSkip(3)(MERGE_PULL_REQUEST)({
    isMergeable: pullRequest.isMergeable,
    isMerged: pullRequest.isMerged,
    message: `${pullRequest.name} (#${state.config.number})`,
    method: 'squash',
    number: state.config.number
  })
  await getters.runOrSkip(4)(DELETE_BRANCH)({
    name: pullRequest.head
  })
  const latestRelease = await getters.runOrSkip(5)(GET_LATEST_RELEASE)({
    isStable: true
  })

  if (state.config.isRelease) {
    const hotfixChangelog = await getters.runOrSkip(6)(GET_CHANGELOG)({
      base: latestRelease.tag,
      head: state.config.branches.master
    })
    const nextRelease = await getters.runOrSkip(7)(GET_NEXT_RELEASE)({
      isBreaking: false,
      isFix: true,
      isPrerelease: false
    })
    await getters.runOrSkip(8)(CREATE_RELEASE)({
      branch: state.config.branches.master,
      changelog: hotfixChangelog.text,
      isPrerelease: false,
      name: nextRelease.name,
      tag: nextRelease.tag
    })
  }

  const releaseBranch = await getters.runOrSkip(9)(GET_RELEASE_BRANCH)()

  const branchMatch = new RegExp(
    '^.*?(\\d+)\\.(\\d+)\\.\\d+$'
  ).exec(releaseBranch.name)
  const tagMatch = new RegExp(
    `^${state.config.tag}(\\d+)\\.(\\d+)\\.\\d+$`
  ).exec(latestRelease.tag)

  if (
    gt(get(1)(branchMatch))(get(1)(tagMatch)) ||
    gt(get(2)(branchMatch))(get(2)(tagMatch))
  ) {
    await getters.runOrSkip(10)(MERGE_BRANCHES)({
      base: releaseBranch.name,
      head: state.config.branches.master
    })

    if (state.config.isRelease) {
      const latestPrerelease = await getters.runOrSkip(11)(GET_LATEST_RELEASE)({
        isPrerelease: true
      })
      const fixChangelog = await getters.runOrSkip(12)(GET_CHANGELOG)({
        base: latestPrerelease.tag,
        head: releaseBranch.name
      })
      const nextPrerelease = await getters.runOrSkip(13)(GET_NEXT_RELEASE)({
        isBreaking: false,
        isFix: true,
        isPrerelease: true
      })
      await getters.runOrSkip(14)(CREATE_RELEASE)({
        branch: releaseBranch.name,
        changelog: fixChangelog.text,
        isPrerelease: true,
        name: nextPrerelease.name,
        tag: nextPrerelease.tag
      })
    }

    await getters.runOrSkip(15)(MERGE_BRANCHES)({
      base: state.config.branches.develop,
      head: releaseBranch.name
    })
    await getters.runOrSkip(16)(UPDATE_BRANCH)({
      base: state.config.branches.beta,
      head: releaseBranch.name
    })
  } else {
    await getters.runOrSkip(17)(MERGE_BRANCHES)({
      base: state.config.branches.develop,
      head: state.config.branches.master
    })
  }

  return logActionEnd(RUN_HOTFIX_FINISH)
}

export { RUN_HOTFIX_FINISH }
export default runHotfixFinish
