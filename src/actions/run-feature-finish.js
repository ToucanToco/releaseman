import concat from 'lodash/fp/concat'
import flow from 'lodash/fp/flow'
import includes from 'lodash/fp/includes'
import isEqual from 'lodash/fp/isEqual'
import map from 'lodash/fp/map'
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
    'number'
  )

  const pullRequest = await getters.runOrSkip(0, 1)(GET_PULL_REQUEST)({
    number: state.config.number
  })

  if (getters.matchesTaskIndex(1)) {
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
  }

  const pullRequestLabels = (
    await getters.runOrSkip(1, 2)(GET_PULL_REQUEST_LABELS)({
      number: state.config.number
    })
  )

  const featureLabel = (
    state.config.isDoc
      ? state.config.labels.doc
      : state.config.labels.feature
  )

  if (getters.matchesTaskIndex(2, 3) && !flow(
    map('name'),
    includes(featureLabel)
  )(pullRequestLabels)) {
    logWarn(`Missing ${featureLabel} label.\n`)

    await getters.runOrSkip(2, 3)(UPDATE_PULL_REQUEST_LABELS)({
      labels: flow(
        map('name'),
        concat(featureLabel)
      )(pullRequestLabels),
      number: state.config.number
    })
  }

  await getters.runOrSkip(2, 3, 4)(MERGE_PULL_REQUEST)({
    isMergeable: pullRequest.isMergeable,
    isMerged: pullRequest.isMerged,
    message: `${pullRequest.name} (#${pullRequest.number})`,
    method: 'squash',
    number: state.config.number
  })
  await getters.runOrSkip(4, 5)(DELETE_BRANCH)({
    name: pullRequest.head
  })

  return logActionEnd(RUN_FEATURE_FINISH)
}

export { RUN_FEATURE_FINISH }
export default runFeatureFinish
