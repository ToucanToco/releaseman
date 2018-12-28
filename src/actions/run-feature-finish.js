import concat from 'lodash/fp/concat'
import flow from 'lodash/fp/flow'
import includes from 'lodash/fp/includes'
import isEmpty from 'lodash/fp/isEmpty'
import isEqual from 'lodash/fp/isEqual'
import map from 'lodash/fp/map'
import startsWith from 'lodash/fp/startsWith'
import { SET_DATA, ASSIGN_DATA } from '../mutations'
import {
  DELETE_BRANCH,
  GET_PULL_REQUEST,
  GET_PULL_REQUEST_LABELS,
  MERGE_PULL_REQUEST,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions'
import { logActionEnd, logActionStart, logWarn } from '../log'

const RUN_FEATURE_FINISH = 'RUN_FEATURE_FINISH'

const runFeatureFinish = ({ commit, getters, state }) => {
  logActionStart(RUN_FEATURE_FINISH)

  const configError = getters.configError(
    'branches.develop',
    ...(
      state.config.isDoc
        ? ['branches.doc', 'labels.doc']
        : ['branches.feature', 'labels.feature']
    ),
    'number'
  )
  const featureBranchesPrefix = (
    state.config.isDoc
      ? state.config.branches.doc
      : state.config.branches.feature
  )
  const featureLabel = (
    state.config.isDoc
      ? state.config.labels.doc
      : state.config.labels.feature
  )

  if (!isEmpty(configError)) {
    return Promise.reject(configError)
  }
  if (getters.isCurrentTaskIndex(0)) {
    commit(SET_DATA, {
      number: state.config.number
    })
  }

  return getters.runOrSkip(0, 1)(GET_PULL_REQUEST)
    .then(() => {
      if (getters.isCurrentTaskIndex(1)) {
        if (!isEqual(state.config.branches.develop)(state.data.base)) {
          return Promise.reject(
            `A feature cannot be merged into \`${state.data.base}\`!`
          )
        }
        if (!startsWith(featureBranchesPrefix)(state.data.head)) {
          return Promise.reject(`A feature branch name must start with \`${
            featureBranchesPrefix
          }\`, your branch name is \`${state.data.head}\`!`)
        }
      }

      return undefined
    })
    .then(() => getters.runOrSkip(1, 2)(GET_PULL_REQUEST_LABELS))
    .then(() => {
      if (getters.isCurrentTaskIndex(2)) {
        if (flow(
          map('name'),
          includes(featureLabel)
        )(state.data.labels)) {
          return undefined
        }

        logWarn(`Missing ${featureLabel} label.\n`)

        commit(ASSIGN_DATA, {
          labels: flow(
            map('name'),
            concat(featureLabel)
          )(state.data.labels)
        })
      }

      return getters.runOrSkip(2, 3)(UPDATE_PULL_REQUEST_LABELS)
    })
    .then(() => {
      if (getters.isCurrentTaskIndex(2) || getters.isCurrentTaskIndex(3)) {
        return commit(ASSIGN_DATA, {
          message: `${state.data.name} (#${state.data.number})`,
          method: 'squash'
        })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(2, 3, 4)(MERGE_PULL_REQUEST))
    .then(() => {
      if (getters.isCurrentTaskIndex(4)) {
        return commit(ASSIGN_DATA, {
          branch: state.data.head
        })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(4, 5)(DELETE_BRANCH))
    .then(() => logActionEnd(RUN_FEATURE_FINISH))
}

export { RUN_FEATURE_FINISH }
export default runFeatureFinish
