import concat from 'lodash/fp/concat'
import flow from 'lodash/fp/flow'
import includes from 'lodash/fp/includes'
import isEqual from 'lodash/fp/isEqual'
import map from 'lodash/fp/map'
import startsWith from 'lodash/fp/startsWith'
import { SET_DATA, ASSIGN_DATA } from '../mutations'
import {
  CREATE_RELEASE,
  DELETE_BRANCH,
  FIND_RELEASE_PULL_REQUEST,
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

const runFixFinish = async ({ commit, getters, state }) => {
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

  const fixBranchesPrefix = (
    state.config.isDoc
      ? state.config.branches.doc
      : state.config.branches.fix
  )
  const fixLabel = (
    state.config.isDoc
      ? state.config.labels.doc
      : state.config.labels.fix
  )

  if (getters.isCurrentTaskIndex(0)) {
    commit(SET_DATA, {})
  }

  await getters.runOrSkip(0, 1)(GET_RELEASE_BRANCH)

  if (getters.isCurrentTaskIndex(1)) {
    commit(ASSIGN_DATA, {
      number: state.config.number
    })
  }

  await getters.runOrSkip(1, 2)(GET_PULL_REQUEST)

  if (getters.isCurrentTaskIndex(2)) {
    if (!isEqual(state.data.branch)(state.data.base)) {
      throw `A fix cannot be merged into \`${state.data.base}\`!`
    }
    if (!startsWith(fixBranchesPrefix)(state.data.head)) {
      throw `A fix branch name must start with \`${
        fixBranchesPrefix
      }\`, your branch name is \`${state.data.head}\`!`
    }
  }

  await getters.runOrSkip(2, 3)(GET_PULL_REQUEST_LABELS)

  if (getters.isCurrentTaskIndex(3)) {
    if (!flow(
      map('name'),
      includes(fixLabel)
    )(state.data.labels)) {
      logWarn(`Missing ${fixLabel} label.\n`)

      commit(ASSIGN_DATA, {
        labels: flow(
          map('name'),
          concat(fixLabel)
        )(state.data.labels)
      })

      await getters.runOrSkip(3, 4)(UPDATE_PULL_REQUEST_LABELS)
    }
  } else {
    await getters.runOrSkip(3, 4)(UPDATE_PULL_REQUEST_LABELS)
  }
  if (getters.isCurrentTaskIndex(3) || getters.isCurrentTaskIndex(4)) {
    commit(ASSIGN_DATA, {
      message: `${state.data.name} (#${state.data.number})`,
      method: 'squash'
    })
  }

  await getters.runOrSkip(3, 4, 5)(MERGE_PULL_REQUEST)

  if (getters.isCurrentTaskIndex(5)) {
    commit(ASSIGN_DATA, {
      branch: state.data.head
    })
  }

  await getters.runOrSkip(5, 6)(DELETE_BRANCH)

  if (state.config.isRelease) {
    if (getters.isCurrentTaskIndex(6)) {
      commit(ASSIGN_DATA, { isPrerelease: true })
    }

    await getters.runOrSkip(6, 7)(GET_LATEST_RELEASE)

    if (getters.isCurrentTaskIndex(7)) {
      commit(ASSIGN_DATA, {
        base: state.data.tag,
        head: state.data.base
      })
    }

    await getters.runOrSkip(7, 8)(GET_CHANGELOG)

    if (getters.isCurrentTaskIndex(8)) {
      return commit(ASSIGN_DATA, { isFix: true })
    }

    await getters.runOrSkip(8, 9)(GET_NEXT_RELEASE)

    if (getters.isCurrentTaskIndex(9)) {
      commit(ASSIGN_DATA, { branch: state.data.head })
    }

    await getters.runOrSkip(9, 10)(CREATE_RELEASE)

    if (getters.isCurrentTaskIndex(10)) {
      commit(ASSIGN_DATA, {
        base: state.config.branches.master
      })
    }

    await getters.runOrSkip(10, 11)(GET_CHANGELOG)
    await getters.runOrSkip(11, 12)(FIND_RELEASE_PULL_REQUEST)

    if (getters.isCurrentTaskIndex(12)) {
      commit(ASSIGN_DATA, { name: undefined })
    }

    await getters.runOrSkip(12, 13)(UPDATE_PULL_REQUEST)
  } else if (getters.isCurrentTaskIndex(6)) {
    commit(ASSIGN_DATA, { head: state.data.base })
  }
  if (getters.isCurrentTaskIndex(6) || getters.isCurrentTaskIndex(13)) {
    commit(ASSIGN_DATA, {
      base: state.config.branches.develop
    })
  }

  await getters.runOrSkip(6, 13, 14)(MERGE_BRANCHES)

  if (getters.isCurrentTaskIndex(14)) {
    commit(ASSIGN_DATA, {
      base: state.config.branches.beta
    })
  }

  await getters.runOrSkip(14, 15)(UPDATE_BRANCH)

  return logActionEnd(RUN_FIX_FINISH)
}

export { RUN_FIX_FINISH }
export default runFixFinish
