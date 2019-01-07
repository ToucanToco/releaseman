import kebabCase from 'lodash/fp/kebabCase'
import { CREATE_PULL_REQUEST, UPDATE_PULL_REQUEST_LABELS } from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_FEATURE_PUBLISH = 'RUN_FEATURE_PUBLISH'

const runFeaturePublish = ({ getters, state }) => async () => {
  logActionStart(RUN_FEATURE_PUBLISH)
  getters.validateConfig(
    'branches.develop',
    ...(
      state.config.isDoc
        ? ['branches.doc', 'labels.doc']
        : ['branches.feature', 'labels.feature']
    ),
    'labels.wip',
    'name'
  )

  const pullRequest = await getters.runOrSkip(0)(CREATE_PULL_REQUEST)({
    base: state.config.branches.develop,
    changelog: undefined,
    head: `${
      state.config.isDoc
        ? state.config.branches.doc
        : state.config.branches.feature
    }${kebabCase(state.config.name)}`,
    name: `${
      state.config.isDoc
        ? 'Doc'
        : 'Feature'
    } :: ${state.config.name}`
  })
  await getters.runOrSkip(1)(UPDATE_PULL_REQUEST_LABELS)({
    labels: [
      (
        state.config.isDoc
          ? state.config.labels.doc
          : state.config.labels.feature
      ),
      state.config.labels.wip
    ],
    number: pullRequest.number
  })

  return logActionEnd(RUN_FEATURE_PUBLISH)
}

export { RUN_FEATURE_PUBLISH }
export default runFeaturePublish
