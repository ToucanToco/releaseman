import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import includes from 'lodash/fp/includes'
import isEmpty from 'lodash/fp/isEmpty'
import last from 'lodash/fp/last'
import map from 'lodash/fp/map'
import reject from 'lodash/fp/reject'
import toPairs from 'lodash/fp/toPairs'
import { ASSIGN_DATA, SET_DATA } from '../mutations'
import {
  CREATE_BRANCH,
  CREATE_LABELS,
  CREATE_RELEASE,
  GET_BRANCH_EXISTENCE,
  GET_LABELS,
  GET_LATEST_RELEASE,
  GET_RELEASES_EXISTENCE
} from '../actions'
import { logActionEnd, logActionStart, logWarn } from '../log'

const LABELS_DEFAULT_COLORS = {
  breaking: 'ffc107',
  doc: '607d8b',
  feature: '4caf50',
  fix: 'f44336',
  release: '2196f3',
  wip: '9c27b0'
}
const RUN_INIT = 'RUN_INIT'

const runInit = async ({ commit, getters, state }) => {
  logActionStart(RUN_INIT)
  getters.validateConfig(
    'branches.beta',
    'branches.develop',
    'branches.master',
    'labels.breaking',
    'labels.doc',
    'labels.feature',
    'labels.fix',
    'labels.release',
    'labels.wip',
    'tag'
  )

  if (getters.matchesTaskIndex(0)) {
    commit(SET_DATA, { branch: state.config.branches.develop })
  }

  await getters.runOrSkip(0, 1)(GET_BRANCH_EXISTENCE)

  if (getters.matchesTaskIndex(1)) {
    if (state.data.isBranchPresent) {
      logWarn(`${state.config.branches.develop} already present.\n`)
    } else {
      commit(ASSIGN_DATA, {
        base: state.config.branches.master,
        head: state.config.branches.develop
      })

      await getters.runOrSkip(1, 2)(CREATE_BRANCH)
    }
  } else {
    await getters.runOrSkip(1, 2)(CREATE_BRANCH)
  }
  if (getters.matchesTaskIndex(1, 2)) {
    commit(ASSIGN_DATA, { isPrerelease: false })
  }

  await getters.runOrSkip(1, 2, 3)(GET_RELEASES_EXISTENCE)

  if (getters.matchesTaskIndex(3)) {
    if (state.data.isWithReleases) {
      logWarn('Release already present.\n')
    } else {
      commit(ASSIGN_DATA, {
        branch: state.config.branches.master,
        changelog: {
          labels: [],
          text: 'Initial release'
        },
        name: 'Initial release',
        tag: `${state.config.tag}0.0.0`
      })

      await getters.runOrSkip(3, 4)(CREATE_RELEASE)
    }
  } else {
    await getters.runOrSkip(3, 4)(CREATE_RELEASE)
  }
  if (getters.matchesTaskIndex(3, 4)) {
    commit(ASSIGN_DATA, { isPrerelease: true })
  }

  await getters.runOrSkip(3, 4, 5)(GET_RELEASES_EXISTENCE)

  if (getters.matchesTaskIndex(5)) {
    if (state.data.isWithReleases) {
      logWarn('Prerelease already present.\n')
    } else {
      commit(ASSIGN_DATA, { isPrerelease: false })

      await getters.runOrSkip(5, 6)(GET_LATEST_RELEASE)

      if (getters.matchesTaskIndex(6)) {
        commit(ASSIGN_DATA, {
          branch: state.config.branches.master,
          changelog: {
            labels: [],
            text: `${state.data.name} beta`
          },
          isPrerelease: true,
          name: `${state.data.name} beta`,
          tag: `${state.data.tag}-beta`
        })
      }

      await getters.runOrSkip(6, 7)(CREATE_RELEASE)
    }
  } else {
    await getters.runOrSkip(5, 6)(GET_LATEST_RELEASE)

    if (getters.matchesTaskIndex(6)) {
      commit(ASSIGN_DATA, {
        branch: state.config.branches.master,
        changelog: {
          labels: [],
          text: `${state.data.name} beta`
        },
        isPrerelease: true,
        name: `${state.data.name} beta`,
        tag: `${state.data.tag}-beta`
      })
    }

    await getters.runOrSkip(6, 7)(CREATE_RELEASE)
  }
  if (getters.matchesTaskIndex(5, 7)) {
    commit(SET_DATA, { branch: state.config.branches.beta })
  }

  await getters.runOrSkip(5, 7, 8)(GET_BRANCH_EXISTENCE)

  if (getters.matchesTaskIndex(8)) {
    if (state.data.isBranchPresent) {
      logWarn(`${state.config.branches.beta} already present.\n`)
    } else {
      commit(ASSIGN_DATA, {
        base: state.config.branches.master,
        head: state.config.branches.beta
      })

      await getters.runOrSkip(8, 9)(CREATE_BRANCH)
    }
  } else {
    await getters.runOrSkip(8, 9)(CREATE_BRANCH)
  }

  await getters.runOrSkip(8, 9, 10)(GET_LABELS)

  if (getters.matchesTaskIndex(10)) {
    const labelsNames = map('name')(state.data.labels)

    const missingLabels = flow(
      toPairs,
      reject((labelPair) => includes(last(labelPair))(labelsNames)),
      map(([key, name]) => ({
        color: get(key)(LABELS_DEFAULT_COLORS),
        name: name
      }))
    )(state.config.labels)

    if (isEmpty(missingLabels)) {
      logWarn('All mandatory labels already present.\n')
    } else {
      commit(ASSIGN_DATA, { labels: missingLabels })

      await getters.runOrSkip(10, 11)(CREATE_LABELS)
    }
  } else {
    await getters.runOrSkip(10, 11)(CREATE_LABELS)
  }

  return logActionEnd(RUN_INIT)
}

export { RUN_INIT }
export default runInit
