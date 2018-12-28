import concat from 'lodash/fp/concat'
import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import gt from 'lodash/fp/gt'
import includes from 'lodash/fp/includes'
import isEmpty from 'lodash/fp/isEmpty'
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

const runHotfixFinish = ({ commit, getters, state }) => {
  logActionStart(RUN_HOTFIX_FINISH)

  const configError = getters.configError(
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
        if (!isEqual(state.config.branches.master)(state.data.base)) {
          return Promise.reject(
            `A hotfix cannot be merged into \`${state.data.base}\`!`
          )
        }
        if (!startsWith(hotfixBranchesPrefix)(state.data.head)) {
          return Promise.reject(`A hotfix branch name must start with \`${
            hotfixBranchesPrefix
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
          includes(fixLabel)
        )(state.data.labels)) {
          return undefined
        }

        logWarn(`Missing ${fixLabel} label.\n`)

        commit(ASSIGN_DATA, {
          labels: flow(
            map('name'),
            concat(fixLabel)
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
    .then(() => {
      if (state.config.isRelease) {
        if (getters.isCurrentTaskIndex(5)) {
          commit(ASSIGN_DATA, { isPrerelease: false })
        }

        return getters.runOrSkip(5, 6)(GET_LATEST_RELEASE)
          .then(() => {
            if (getters.isCurrentTaskIndex(6)) {
              return commit(ASSIGN_DATA, {
                base: state.data.tag,
                head: state.data.base
              })
            }

            return undefined
          })
          .then(() => getters.runOrSkip(6, 7)(GET_CHANGELOG))
          .then(() => {
            if (getters.isCurrentTaskIndex(7)) {
              return commit(ASSIGN_DATA, { isFix: true })
            }

            return undefined
          })
          .then(() => getters.runOrSkip(7, 8)(GET_NEXT_RELEASE))
          .then(() => {
            if (getters.isCurrentTaskIndex(8)) {
              return commit(ASSIGN_DATA, { branch: state.data.head })
            }

            return undefined
          })
          .then(() => getters.runOrSkip(8, 9)(CREATE_RELEASE))
      }

      return undefined
    })
    .then(() => getters.runOrSkip(5, 9, 10)(GET_RELEASE_BRANCH))
    .then(() => {
      if (getters.isCurrentTaskIndex(10)) {
        const branchMatch = new RegExp(
          '^.*?(\\d+)\\.(\\d+)\\.\\d+$'
        ).exec(state.data.branch)
        const tagMatch = new RegExp(
          `^${state.config.tag}(\\d+)\\.(\\d+)\\.\\d+$`
        ).exec(state.data.tag)

        return commit(ASSIGN_DATA, {
          isWithReleaseBranch: (
            gt(get(1)(branchMatch))(get(1)(tagMatch)) ||
            gt(get(2)(branchMatch))(get(2)(tagMatch))
          )
        })
      }

      return undefined
    })
    .then(() => {
      if (state.data.isWithReleaseBranch) {
        if (getters.isCurrentTaskIndex(10)) {
          commit(ASSIGN_DATA, {
            base: state.data.branch,
            head: state.config.branches.master
          })
        }

        return getters.runOrSkip(10, 11)(MERGE_BRANCHES)
          .then(() => {
            if (state.config.isRelease) {
              if (getters.isCurrentTaskIndex(11)) {
                commit(ASSIGN_DATA, { isPrerelease: true })
              }

              return getters.runOrSkip(11, 12)(GET_LATEST_RELEASE)
                .then(() => {
                  if (getters.isCurrentTaskIndex(12)) {
                    return commit(ASSIGN_DATA, {
                      base: state.data.tag,
                      head: state.data.base
                    })
                  }

                  return undefined
                })
                .then(() => getters.runOrSkip(12, 13)(GET_CHANGELOG))
                .then(() => getters.runOrSkip(13, 14)(GET_NEXT_RELEASE))
                .then(() => {
                  if (getters.isCurrentTaskIndex(14)) {
                    return commit(ASSIGN_DATA, { branch: state.data.head })
                  }

                  return undefined
                })
                .then(() => getters.runOrSkip(14, 15)(CREATE_RELEASE))
            }
            if (getters.isCurrentTaskIndex(11)) {
              return commit(ASSIGN_DATA, { head: state.data.base })
            }

            return undefined
          })
          .then(() => {
            if (
              getters.isCurrentTaskIndex(11) || getters.isCurrentTaskIndex(15)
            ) {
              return commit(ASSIGN_DATA, {
                base: state.config.branches.develop
              })
            }

            return undefined
          })
          .then(() => getters.runOrSkip(11, 15, 16)(MERGE_BRANCHES))
          .then(() => {
            if (getters.isCurrentTaskIndex(16)) {
              return commit(ASSIGN_DATA, {
                base: state.config.branches.beta
              })
            }

            return undefined
          })
          .then(() => getters.runOrSkip(16, 17)(UPDATE_BRANCH))
      }
      if (getters.isCurrentTaskIndex(10)) {
        commit(ASSIGN_DATA, {
          base: state.config.branches.develop,
          head: state.config.branches.master
        })
      }

      return getters.runOrSkip(10, 18)(MERGE_BRANCHES)
    })
    .then(() => logActionEnd(RUN_HOTFIX_FINISH))
}

export { RUN_HOTFIX_FINISH }
export default runHotfixFinish
