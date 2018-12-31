import concat from 'lodash/fp/concat'
import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import gt from 'lodash/fp/gt'
import includes from 'lodash/fp/includes'
import isEqual from 'lodash/fp/isEqual'
import map from 'lodash/fp/map'
import startsWith from 'lodash/fp/startsWith'
import { SET_DATA, ASSIGN_DATA } from '../mutations'
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

const runHotfixFinish = async ({ commit, getters, state }) => {
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
    'number',
    'tag'
  )

  const hotfixBranchesPrefix = (
    state.config.isDoc
      ? state.config.branches.doc
      : state.config.branches.hotfix
  )
  const fixLabel = (
    state.config.isDoc
      ? state.config.labels.doc
      : state.config.labels.fix
  )

  if (getters.matchesTaskIndex(0)) {
    commit(SET_DATA, {
      number: state.config.number
    })
  }

  await getters.runOrSkip(0, 1)(GET_PULL_REQUEST)

  if (getters.matchesTaskIndex(1)) {
    if (!isEqual(state.config.branches.master)(state.data.base)) {
      throw `A hotfix cannot be merged into \`${state.data.base}\`!`
    }
    if (!startsWith(hotfixBranchesPrefix)(state.data.head)) {
      throw `A hotfix branch name must start with \`${
        hotfixBranchesPrefix
      }\`, your branch name is \`${state.data.head}\`!`
    }
  }

  await getters.runOrSkip(1, 2)(GET_PULL_REQUEST_LABELS)

  if (getters.matchesTaskIndex(2)) {
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

      await getters.runOrSkip(2, 3)(UPDATE_PULL_REQUEST_LABELS)
    }
  } else {
    await getters.runOrSkip(2, 3)(UPDATE_PULL_REQUEST_LABELS)
  }
  if (getters.matchesTaskIndex(2, 3)) {
    commit(ASSIGN_DATA, {
      message: `${state.data.name} (#${state.data.number})`,
      method: 'squash'
    })
  }

  await getters.runOrSkip(2, 3, 4)(MERGE_PULL_REQUEST)

  if (getters.matchesTaskIndex(4)) {
    commit(ASSIGN_DATA, {
      branch: state.data.head
    })
  }

  await getters.runOrSkip(4, 5)(DELETE_BRANCH)

  if (state.config.isRelease) {
    if (getters.matchesTaskIndex(5)) {
      commit(ASSIGN_DATA, { isPrerelease: false })
    }

    await getters.runOrSkip(5, 6)(GET_LATEST_RELEASE)

    if (getters.matchesTaskIndex(6)) {
      commit(ASSIGN_DATA, {
        base: state.data.tag,
        head: state.data.base
      })
    }

    await getters.runOrSkip(6, 7)(GET_CHANGELOG)

    if (getters.matchesTaskIndex(7)) {
      commit(ASSIGN_DATA, { isFix: true })
    }

    await getters.runOrSkip(7, 8)(GET_NEXT_RELEASE)

    if (getters.matchesTaskIndex(8)) {
      commit(ASSIGN_DATA, { branch: state.data.head })
    }

    await getters.runOrSkip(8, 9)(CREATE_RELEASE)
  }

  await getters.runOrSkip(5, 9, 10)(GET_RELEASE_BRANCH)

  if (getters.matchesTaskIndex(10)) {
    const branchMatch = new RegExp(
      '^.*?(\\d+)\\.(\\d+)\\.\\d+$'
    ).exec(state.data.branch)
    const tagMatch = new RegExp(
      `^${state.config.tag}(\\d+)\\.(\\d+)\\.\\d+$`
    ).exec(state.data.tag)

    commit(ASSIGN_DATA, {
      isWithReleaseBranch: (
        gt(get(1)(branchMatch))(get(1)(tagMatch)) ||
        gt(get(2)(branchMatch))(get(2)(tagMatch))
      )
    })
  }
  if (state.data.isWithReleaseBranch) {
    if (getters.matchesTaskIndex(10)) {
      commit(ASSIGN_DATA, {
        base: state.data.branch,
        head: state.config.branches.master
      })
    }

    await getters.runOrSkip(10, 11)(MERGE_BRANCHES)

    if (state.config.isRelease) {
      if (getters.matchesTaskIndex(11)) {
        commit(ASSIGN_DATA, { isPrerelease: true })
      }

      await getters.runOrSkip(11, 12)(GET_LATEST_RELEASE)

      if (getters.matchesTaskIndex(12)) {
        commit(ASSIGN_DATA, {
          base: state.data.tag,
          head: state.data.base
        })
      }

      await getters.runOrSkip(12, 13)(GET_CHANGELOG)
      await getters.runOrSkip(13, 14)(GET_NEXT_RELEASE)

      if (getters.matchesTaskIndex(14)) {
        commit(ASSIGN_DATA, { branch: state.data.head })
      }

      await getters.runOrSkip(14, 15)(CREATE_RELEASE)
    } else if (getters.matchesTaskIndex(11)) {
      commit(ASSIGN_DATA, { head: state.data.base })
    }
    if (getters.matchesTaskIndex(11, 15)) {
      commit(ASSIGN_DATA, {
        base: state.config.branches.develop
      })
    }

    await getters.runOrSkip(11, 15, 16)(MERGE_BRANCHES)

    if (getters.matchesTaskIndex(16)) {
      commit(ASSIGN_DATA, {
        base: state.config.branches.beta
      })
    }

    await getters.runOrSkip(16, 17)(UPDATE_BRANCH)
  } else {
    if (getters.matchesTaskIndex(10)) {
      commit(ASSIGN_DATA, {
        base: state.config.branches.develop,
        head: state.config.branches.master
      })
    }

    await getters.runOrSkip(10, 18)(MERGE_BRANCHES)
  }

  return logActionEnd(RUN_HOTFIX_FINISH)
}

export { RUN_HOTFIX_FINISH }
export default runHotfixFinish
