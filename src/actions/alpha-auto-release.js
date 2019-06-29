import {
  CREATE_PULL_REQUEST,
  GET_CHANGELOG,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions'

const ALPHA_AUTO_RELEASE = 'ALPHA_AUTO_RELEASE'

const alphaAutoRelease = ({ getters, state }) => async ({ index, name }) => {
  getters.validateConfig(
    'branches.alpha',
    'branches.beta',
    'categories',
    'labels.breaking',
    'labels.release'
  )

  const changelog = await getters.runOrSkip(index + 1)(GET_CHANGELOG)({
    base: state.config.branches.beta,
    head: state.config.branches.alpha
  })
  const pull = await getters.runOrSkip(index + 2)(CREATE_PULL_REQUEST)({
    base: state.config.branches.beta,
    head: state.config.branches.alpha,
    message: changelog.message,
    name: `Release :: ${name} beta`
  })
  await getters.runOrSkip(index + 3)(UPDATE_PULL_REQUEST_LABELS)({
    labels: changelog.labels.includes(state.config.labels.breaking)
      ? [state.config.labels.breaking, state.config.labels.release]
      : [state.config.labels.release],
    number: pull.number
  })

  return index + 3
}

export { ALPHA_AUTO_RELEASE }
export default alphaAutoRelease
