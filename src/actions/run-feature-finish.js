import concat from 'lodash/fp/concat'
import flow from 'lodash/fp/flow'
import includes from 'lodash/fp/includes'
import isEqual from 'lodash/fp/isEqual'
import map from 'lodash/fp/map'
import some from 'lodash/fp/some'
import startsWith from 'lodash/fp/startsWith'
import {
  DELETE_BRANCH,
  GET_PULL_REQUEST,
  GET_PULL_REQUEST_LABELS,
  MERGE_PULL_REQUEST,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions'
import { logActionEnd, logActionStart, logWarn } from '../log'

const RUN_FEATURE_FINISH = 'RUN_FEATURE_FINISH'

const runFeatureFinish = ({ getters, state }) => async () => {
  logActionStart(RUN_FEATURE_FINISH)
  getters.validateConfig(
    'branches.develop',
    ...(
      state.config.isDoc
        ? ['branches.doc', 'labels.doc']
        : ['branches.feature', 'labels.feature']
    ),
    'labels.wip',
    'number'
  )

  const pullRequest = await getters.runOrSkip(0)(GET_PULL_REQUEST)({
    number: state.config.number
  })

  if (!isEqual(state.config.branches.develop)(pullRequest.base)) {
    throw `A feature cannot be merged into \`${pullRequest.base}\`!`
  }

  const featureBranchesPrefix = (
    state.config.isDoc
      ? state.config.branches.doc
      : state.config.branches.feature
  )

  if (!startsWith(featureBranchesPrefix)(pullRequest.head)) {
    throw `A feature branch name must start with \`${
      featureBranchesPrefix
    }\`, your branch name is \`${pullRequest.head}\`!`
  }

  const pullRequestLabelsName = map('name')(
    await getters.runOrSkip(1)(GET_PULL_REQUEST_LABELS)({
      number: state.config.number
    })
  )

  if (includes(state.config.labels.wip)(pullRequestLabelsName)) {
    throw 'This feature is still a work in progress!'
  }
  if (!flow(
    map('label'),
    concat(state.config.labels.release),
    some((label) => includes(label)(pullRequestLabelsName))
  )(state.config.categories)) {
    const featureLabel = (
      state.config.isDoc
        ? state.config.labels.doc
        : state.config.labels.feature
    )

    logWarn(`Missing label, defaulting to ${featureLabel}.\n`)

    await getters.runOrSkip(2)(UPDATE_PULL_REQUEST_LABELS)({
      labels: concat(featureLabel)(pullRequestLabelsName),
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

  return logActionEnd(RUN_FEATURE_FINISH)
}

export { RUN_FEATURE_FINISH }
export default runFeatureFinish
