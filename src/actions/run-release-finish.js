import concat from 'lodash/fp/concat'
import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import includes from 'lodash/fp/includes'
import map from 'lodash/fp/map'
import {
  CREATE_RELEASE,
  DELETE_BRANCH,
  FIND_PULL_REQUEST,
  GET_CHANGELOG,
  GET_NEXT_RELEASE,
  GET_PULL_REQUEST_LABELS,
  MERGE_PULL_REQUEST,
  UPDATE_PULL_REQUEST,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions'
import { logActionEnd, logActionStart, logWarn } from '../log'

const RUN_RELEASE_FINISH = 'RUN_RELEASE_FINISH'

const runReleaseFinish = ({ getters, state }) => async () => {
  logActionStart(RUN_RELEASE_FINISH)
  getters.validateConfig(
    'branches.master',
    'branches.release',
    'categories',
    'labels.release',
    'labels.wip',
    'tag'
  )

  const nextRelease = await getters.runOrSkip(0)(GET_NEXT_RELEASE)({
    isBreaking: false,
    isFix: false,
    isPrerelease: false
  })

  const version = get(1)(
    new RegExp(`^${state.config.tag}(\\d+\\.\\d+\\.\\d+)$`)
      .exec(nextRelease.tag)
  )

  const branch = `${state.config.branches.release}${version}`

  const changelog = await getters.runOrSkip(1)(GET_CHANGELOG)({
    base: state.config.branches.master,
    head: branch
  })
  const pullRequest = await getters.runOrSkip(2)(FIND_PULL_REQUEST)({
    base: state.config.branches.master,
    head: branch
  })

  const pullRequestName = `Release :: ${nextRelease.name}`

  await getters.runOrSkip(3)(UPDATE_PULL_REQUEST)({
    changelog: changelog.text,
    name: pullRequestName,
    number: pullRequest.number
  })
  const pullRequestLabelsName = map('name')(
    await getters.runOrSkip(4)(GET_PULL_REQUEST_LABELS)({
      number: pullRequest.number
    })
  )

  if (includes(state.config.labels.wip)(pullRequestLabelsName)) {
    throw 'This release is still a work in progress!'
  }
  if (!includes(state.config.labels.release)(pullRequestLabelsName)) {
    logWarn(`Missing ${state.config.labels.release} label.\n`)

    await getters.runOrSkip(5)(UPDATE_PULL_REQUEST_LABELS)({
      labels: concat(state.config.labels.release)(pullRequestLabelsName),
      number: state.config.number
    })
  }

  await getters.runOrSkip(6)(MERGE_PULL_REQUEST)({
    isMergeable: pullRequest.isMergeable,
    isMerged: pullRequest.isMerged,
    message: `${pullRequestName} (#${pullRequest.number})`,
    method: undefined,
    number: pullRequest.number
  })
  await getters.runOrSkip(7)(DELETE_BRANCH)({
    name: branch
  })
  await getters.runOrSkip(8)(CREATE_RELEASE)({
    branch: state.config.branches.master,
    changelog: changelog.text,
    isPrerelease: false,
    name: nextRelease.name,
    tag: nextRelease.tag
  })

  return logActionEnd(RUN_RELEASE_FINISH)
}

export { RUN_RELEASE_FINISH }
export default runReleaseFinish
