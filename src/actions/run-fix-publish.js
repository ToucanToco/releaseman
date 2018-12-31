import kebabCase from 'lodash/fp/kebabCase'
import { ASSIGN_DATA, SET_DATA } from '../mutations'
import {
  CREATE_PULL_REQUEST,
  GET_RELEASE_BRANCH,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_FIX_PUBLISH = 'RUN_FIX_PUBLISH'

const runFixPublish = async ({ commit, getters, state }) => {
  logActionStart(RUN_FIX_PUBLISH)
  getters.validateConfig(
    (
      state.config.isDoc
        ? 'branches.doc'
        : 'branches.fix'
    ),
    'branches.release',
    (
      state.config.isDoc
        ? 'labels.doc'
        : 'labels.fix'
    ),
    'labels.wip',
    'name',
    'tag'
  )

  if (getters.matchesTaskIndex(0)) {
    commit(SET_DATA, {})
  }

  await getters.runOrSkip(0, 1)(GET_RELEASE_BRANCH)

  if (getters.matchesTaskIndex(1)) {
    commit(ASSIGN_DATA, {
      base: state.data.branch,
      changelog: {
        labels: [],
        text: undefined
      },
      head: `${
        state.config.isDoc
          ? state.config.branches.doc
          : state.config.branches.fix
      }${kebabCase(state.config.name)}`,
      name: `${
        state.config.isDoc
          ? 'Doc'
          : 'Fix'
      } :: ${state.config.name}`
    })
  }

  await getters.runOrSkip(1, 2)(CREATE_PULL_REQUEST)

  if (getters.matchesTaskIndex(2)) {
    commit(ASSIGN_DATA, {
      labels: [
        (
          state.config.isDoc
            ? state.config.labels.doc
            : state.config.labels.fix
        ),
        state.config.labels.wip
      ]
    })
  }

  await getters.runOrSkip(2, 3)(UPDATE_PULL_REQUEST_LABELS)

  return logActionEnd(RUN_FIX_PUBLISH)
}

export { RUN_FIX_PUBLISH }
export default runFixPublish
