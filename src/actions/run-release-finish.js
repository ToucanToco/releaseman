import concat from 'lodash/fp/concat'
import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import includes from 'lodash/fp/includes'
import isEmpty from 'lodash/fp/isEmpty'
import map from 'lodash/fp/map'
import replace from 'lodash/fp/replace'
import { ASSIGN_DATA, SET_DATA } from '../mutations'
import {
  CREATE_RELEASE,
  DELETE_BRANCH,
  FIND_RELEASE_PULL_REQUEST,
  GET_CHANGELOG,
  GET_NEXT_RELEASE,
  GET_PULL_REQUEST,
  GET_PULL_REQUEST_LABELS,
  MERGE_PULL_REQUEST,
  UPDATE_PULL_REQUEST,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions'
import { logActionEnd, logActionStart, logWarn } from '../log'

const RUN_RELEASE_FINISH = 'RUN_RELEASE_FINISH'

const runReleaseFinish = ({ commit, getters, state }) => {
  logActionStart(RUN_RELEASE_FINISH)

  const configError = getters.configError(
    'branches.master',
    'branches.release',
    'categories',
    'labels.release',
    'tag'
  )

  if (!isEmpty(configError)) {
    return Promise.reject(configError)
  }
  if (getters.isCurrentTaskIndex(0)) {
    commit(SET_DATA, { isPrerelease: false })
  }

  return getters.runOrSkip(0, 1)(GET_NEXT_RELEASE)
    .then(() => {
      if (getters.isCurrentTaskIndex(1)) {
        const version = get(1)(
          new RegExp(
            `^${state.config.tag}(\\d+\\.\\d+\\.\\d+)$`
          ).exec(state.data.tag)
        )

        return commit(ASSIGN_DATA, {
          base: state.config.branches.master,
          head: `${state.config.branches.release}${version}`
        })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(1, 2)(GET_CHANGELOG))
    .then(() => getters.runOrSkip(2, 3)(FIND_RELEASE_PULL_REQUEST))
    .then(() => {
      if (getters.isCurrentTaskIndex(3)) {
        return commit(ASSIGN_DATA, {
          name: `Release :: ${state.data.name}`
        })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(3, 4)(UPDATE_PULL_REQUEST))
    .then(() => getters.runOrSkip(4, 5)(GET_PULL_REQUEST_LABELS))
    .then(() => {
      if (getters.isCurrentTaskIndex(5)) {
        if (flow(
          map('name'),
          includes(state.config.labels.release)
        )(state.data.labels)) {
          return undefined
        }

        logWarn(`Missing ${state.config.labels.release} label.\n`)

        commit(ASSIGN_DATA, {
          labels: flow(
            map('name'),
            concat(state.config.labels.release)
          )(state.data.labels)
        })
      }

      return getters.runOrSkip(5, 6)(UPDATE_PULL_REQUEST_LABELS)
    })
    .then(() => getters.runOrSkip(5, 6, 7)(GET_PULL_REQUEST))
    .then(() => {
      if (getters.isCurrentTaskIndex(7)) {
        return commit(ASSIGN_DATA, {
          message: `${state.data.name} (#${state.data.number})`
        })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(7, 8)(MERGE_PULL_REQUEST))
    .then(() => {
      if (getters.isCurrentTaskIndex(8)) {
        return commit(ASSIGN_DATA, {
          branch: state.data.head
        })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(8, 9)(DELETE_BRANCH))
    .then(() => {
      if (getters.isCurrentTaskIndex(9)) {
        return commit(ASSIGN_DATA, {
          branch: state.config.branches.master,
          name: replace('Release :: ')('')(state.data.name)
        })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(9, 10)(CREATE_RELEASE))
    .then(() => logActionEnd(RUN_RELEASE_FINISH))
}

export { RUN_RELEASE_FINISH }
export default runReleaseFinish
