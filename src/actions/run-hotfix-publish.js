import kebabCase from 'lodash/fp/kebabCase'
import { ASSIGN_DATA, SET_DATA } from '../mutations'
import { CREATE_PULL_REQUEST, UPDATE_PULL_REQUEST_LABELS } from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_HOTFIX_PUBLISH = 'RUN_HOTFIX_PUBLISH'

const runHotfixPublish = async ({ commit, getters, state }) => {
  logActionStart(RUN_HOTFIX_PUBLISH)
  getters.validateConfig(
    (
      state.config.isDoc
        ? 'branches.doc'
        : 'branches.hotfix'
    ),
    'branches.master',
    (
      state.config.isDoc
        ? 'labels.doc'
        : 'labels.fix'
    ),
    'labels.wip',
    'name'
  )

  if (getters.matchesTaskIndex(0)) {
    commit(SET_DATA, {
      base: state.config.branches.master,
      changelog: {
        labels: [],
        text: undefined
      },
      head: `${
        state.config.isDoc
          ? state.config.branches.doc
          : state.config.branches.hotfix
      }${kebabCase(state.config.name)}`,
      name: `${
        state.config.isDoc
          ? 'Doc'
          : 'Hotfix'
      } :: ${state.config.name}`
    })
  }

  await getters.runOrSkip(0, 1)(CREATE_PULL_REQUEST)

  if (getters.matchesTaskIndex(1)) {
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

  await getters.runOrSkip(1, 2)(UPDATE_PULL_REQUEST_LABELS)

  return logActionEnd(RUN_HOTFIX_PUBLISH)
}

export { RUN_HOTFIX_PUBLISH }
export default runHotfixPublish
