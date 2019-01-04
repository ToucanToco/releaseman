import kebabCase from 'lodash/fp/kebabCase'
import { CREATE_PULL_REQUEST, UPDATE_PULL_REQUEST_LABELS } from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_HOTFIX_PUBLISH = 'RUN_HOTFIX_PUBLISH'

const runHotfixPublish = ({ getters, state }) => async () => {
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

  const pullRequest = await getters.runOrSkip(0)(CREATE_PULL_REQUEST)({
    base: state.config.branches.master,
    changelog: undefined,
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
  await getters.runOrSkip(1)(UPDATE_PULL_REQUEST_LABELS)({
    labels: [
      (
        state.config.isDoc
          ? state.config.labels.doc
          : state.config.labels.fix
      ),
      state.config.labels.wip
    ],
    number: pullRequest.number
  })

  return logActionEnd(RUN_HOTFIX_PUBLISH)
}

export { RUN_HOTFIX_PUBLISH }
export default runHotfixPublish
