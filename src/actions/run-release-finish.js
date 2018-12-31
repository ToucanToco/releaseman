import concat from 'lodash/fp/concat'
import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import includes from 'lodash/fp/includes'
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

const runReleaseFinish = async ({ commit, getters, state }) => {
  logActionStart(RUN_RELEASE_FINISH)
  getters.validateConfig(
    'branches.master',
    'branches.release',
    'categories',
    'labels.release',
    'tag'
  )

  if (getters.isCurrentTaskIndex(0)) {
    commit(SET_DATA, { isPrerelease: false })
  }

  await getters.runOrSkip(0, 1)(GET_NEXT_RELEASE)

  if (getters.isCurrentTaskIndex(1)) {
    const version = get(1)(
      new RegExp(
        `^${state.config.tag}(\\d+\\.\\d+\\.\\d+)$`
      ).exec(state.data.tag)
    )

    commit(ASSIGN_DATA, {
      base: state.config.branches.master,
      head: `${state.config.branches.release}${version}`
    })
  }

  await getters.runOrSkip(1, 2)(GET_CHANGELOG)
  await getters.runOrSkip(2, 3)(FIND_RELEASE_PULL_REQUEST)

  if (getters.isCurrentTaskIndex(3)) {
    commit(ASSIGN_DATA, {
      name: `Release :: ${state.data.name}`
    })
  }

  await getters.runOrSkip(3, 4)(UPDATE_PULL_REQUEST)
  await getters.runOrSkip(4, 5)(GET_PULL_REQUEST_LABELS)

  if (getters.isCurrentTaskIndex(5)) {
    if (!flow(
      map('name'),
      includes(state.config.labels.release)
    )(state.data.labels)) {
      logWarn(`Missing ${state.config.labels.release} label.\n`)

      commit(ASSIGN_DATA, {
        labels: flow(
          map('name'),
          concat(state.config.labels.release)
        )(state.data.labels)
      })

      await getters.runOrSkip(5, 6)(UPDATE_PULL_REQUEST_LABELS)
    }
  } else {
    await getters.runOrSkip(5, 6)(UPDATE_PULL_REQUEST_LABELS)
  }

  await getters.runOrSkip(5, 6, 7)(GET_PULL_REQUEST)

  if (getters.isCurrentTaskIndex(7)) {
    commit(ASSIGN_DATA, {
      message: `${state.data.name} (#${state.data.number})`
    })
  }

  await getters.runOrSkip(7, 8)(MERGE_PULL_REQUEST)

  if (getters.isCurrentTaskIndex(8)) {
    commit(ASSIGN_DATA, {
      branch: state.data.head
    })
  }

  await getters.runOrSkip(8, 9)(DELETE_BRANCH)

  if (getters.isCurrentTaskIndex(9)) {
    commit(ASSIGN_DATA, {
      branch: state.config.branches.master,
      name: replace('Release :: ')('')(state.data.name)
    })
  }

  await getters.runOrSkip(9, 10)(CREATE_RELEASE)

  return logActionEnd(RUN_RELEASE_FINISH)
}

export { RUN_RELEASE_FINISH }
export default runReleaseFinish
