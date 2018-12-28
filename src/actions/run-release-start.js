import get from 'lodash/fp/get'
import includes from 'lodash/fp/includes'
import isEmpty from 'lodash/fp/isEmpty'
import { ASSIGN_DATA, SET_DATA } from '../mutations'
import {
  CREATE_BRANCH,
  CREATE_PULL_REQUEST,
  CREATE_RELEASE,
  GET_CHANGELOG,
  GET_NEXT_RELEASE,
  UPDATE_BRANCH,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_RELEASE_START = 'RUN_RELEASE_START'

const runReleaseStart = ({ commit, getters, state }) => {
  logActionStart(RUN_RELEASE_START)

  const configError = getters.configError(
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

  if (!isEmpty(configError)) {
    return Promise.reject(configError)
  }
  if (/\sbeta$/i.test(state.config.name)) {
    return Promise.reject(
      'The <name> param must be the final release name (no beta)!'
    )
  }
  if (getters.isCurrentTaskIndex(0)) {
    commit(SET_DATA, {
      base: state.config.branches.master,
      head: state.config.branches.develop
    })
  }

  return getters.runOrSkip(0, 1)(GET_CHANGELOG)
    .then(() => {
      if (getters.isCurrentTaskIndex(1)) {
        return commit(ASSIGN_DATA, {
          isBreaking: includes(state.config.labels.breaking)(
            state.data.changelog.labels
          ),
          isPrerelease: true,
          name: state.config.name
        })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(1, 2)(GET_NEXT_RELEASE))
    .then(() => {
      if (getters.isCurrentTaskIndex(2)) {
        const version = get(1)(
          new RegExp(
            `^${state.config.tag}(\\d+\\.\\d+\\.\\d+)-beta$`
          ).exec(state.data.tag)
        )

        return commit(ASSIGN_DATA, {
          base: state.config.branches.develop,
          head: `${state.config.branches.release}${version}`
        })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(2, 3)(CREATE_BRANCH))
    .then(() => {
      if (getters.isCurrentTaskIndex(3)) {
        return commit(ASSIGN_DATA, { branch: state.data.head })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(3, 4)(CREATE_RELEASE))
    .then(() => {
      if (getters.isCurrentTaskIndex(4)) {
        const nameMatch = new RegExp('^(.*?) beta$').exec(state.data.name)

        return commit(ASSIGN_DATA, {
          base: state.config.branches.master,
          name: `Release :: ${get(1)(nameMatch)}`
        })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(4, 5)(CREATE_PULL_REQUEST))
    .then(() => {
      if (getters.isCurrentTaskIndex(5)) {
        return commit(ASSIGN_DATA, {
          labels: [state.config.labels.release]
        })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(5, 6)(UPDATE_PULL_REQUEST_LABELS))
    .then(() => {
      if (getters.isCurrentTaskIndex(6)) {
        return commit(ASSIGN_DATA, {
          base: state.config.branches.beta,
          head: state.data.branch
        })
      }

      return undefined
    })
    .then(() => getters.runOrSkip(6, 7)(UPDATE_BRANCH))
    .then(() => logActionEnd(RUN_RELEASE_START))
}

export { RUN_RELEASE_START }
export default runReleaseStart
